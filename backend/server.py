from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Literal

import jwt
import bcrypt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict, HttpUrl

# ------------------------------------------------------------------
# Setup
# ------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 7  # 7 days

app = FastAPI(title="ATS-Lite: Smart Job Application Tracker")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

STATUS_VALUES = ("Applied", "Interview", "Offer", "Rejected")
StatusLiteral = Literal["Applied", "Interview", "Offer", "Rejected"]


# ------------------------------------------------------------------
# Auth helpers
# ------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    token: Optional[str] = None
    if credentials and credentials.scheme.lower() == "bearer":
        token = credentials.credentials
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ------------------------------------------------------------------
# Models
# ------------------------------------------------------------------
class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: datetime


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


class JobCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    company: str = Field(..., min_length=1, max_length=120)
    location: Optional[str] = Field(default="", max_length=120)
    link: Optional[str] = Field(default="", max_length=500)
    status: StatusLiteral = "Applied"


class JobUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: Optional[str] = Field(default=None, min_length=1, max_length=120)
    company: Optional[str] = Field(default=None, min_length=1, max_length=120)
    location: Optional[str] = Field(default=None, max_length=120)
    link: Optional[str] = Field(default=None, max_length=500)
    status: Optional[StatusLiteral] = None


class Job(BaseModel):
    id: str
    title: str
    company: str
    location: str = ""
    link: str = ""
    status: StatusLiteral
    created_by: str
    created_at: datetime


class JobListResponse(BaseModel):
    items: List[Job]
    total: int
    page: int
    page_size: int
    total_pages: int
    counts_by_status: dict


# ------------------------------------------------------------------
# Auth endpoints
# ------------------------------------------------------------------
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(payload: UserRegister):
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    doc = {
        "id": user_id,
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "created_at": now.isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email)
    return AuthResponse(
        token=token,
        user=UserPublic(id=user_id, name=doc["name"], email=email, created_at=now),
    )


@api_router.post("/auth/login", response_model=AuthResponse)
async def login(payload: UserLogin):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    created_at = user["created_at"]
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    return AuthResponse(
        token=token,
        user=UserPublic(id=user["id"], name=user["name"], email=user["email"], created_at=created_at),
    )


@api_router.get("/auth/me", response_model=UserPublic)
async def me(current_user: dict = Depends(get_current_user)):
    created_at = current_user["created_at"]
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    return UserPublic(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=created_at,
    )


# ------------------------------------------------------------------
# Job endpoints
# ------------------------------------------------------------------
def _serialize_job(doc: dict) -> dict:
    created_at = doc.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    return {
        "id": doc["id"],
        "title": doc["title"],
        "company": doc["company"],
        "location": doc.get("location", "") or "",
        "link": doc.get("link", "") or "",
        "status": doc["status"],
        "created_by": doc["created_by"],
        "created_at": created_at,
    }


@api_router.post("/jobs", response_model=Job)
async def create_job(payload: JobCreate, current_user: dict = Depends(get_current_user)):
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    doc = {
        "id": job_id,
        "title": payload.title.strip(),
        "company": payload.company.strip(),
        "location": (payload.location or "").strip(),
        "link": (payload.link or "").strip(),
        "status": payload.status,
        "created_by": current_user["id"],
        "created_at": now.isoformat(),
    }
    await db.jobs.insert_one(doc)
    return Job(**_serialize_job(doc))


@api_router.get("/jobs", response_model=JobListResponse)
async def list_jobs(
    status: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=9, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    query: dict = {"created_by": current_user["id"]}
    if status and status in STATUS_VALUES:
        query["status"] = status
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"company": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
        ]

    total = await db.jobs.count_documents(query)
    skip = (page - 1) * page_size
    cursor = db.jobs.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(page_size)
    docs = await cursor.to_list(length=page_size)
    items = [Job(**_serialize_job(d)) for d in docs]
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    # Counts by status (across all user's jobs, regardless of filter)
    counts = {s: 0 for s in STATUS_VALUES}
    pipeline = [
        {"$match": {"created_by": current_user["id"]}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ]
    async for row in db.jobs.aggregate(pipeline):
        if row["_id"] in counts:
            counts[row["_id"]] = row["count"]
    counts["All"] = sum(counts.values())

    return JobListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        counts_by_status=counts,
    )


@api_router.patch("/jobs/{job_id}", response_model=Job)
async def update_job(
    job_id: str,
    payload: JobUpdate,
    current_user: dict = Depends(get_current_user),
):
    existing = await db.jobs.find_one({"id": job_id, "created_by": current_user["id"]}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Job not found")

    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if updates:
        for key in ("title", "company", "location", "link"):
            if key in updates and isinstance(updates[key], str):
                updates[key] = updates[key].strip()
        await db.jobs.update_one({"id": job_id}, {"$set": updates})
        existing.update(updates)

    return Job(**_serialize_job(existing))


@api_router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.jobs.delete_one({"id": job_id, "created_by": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"success": True, "id": job_id}


@api_router.get("/")
async def root():
    return {"message": "ATS-Lite API", "version": "1.0.0"}


# ------------------------------------------------------------------
# Startup
# ------------------------------------------------------------------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin user {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info(f"Updated admin password for {admin_email}")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.jobs.create_index("created_by")
    await db.jobs.create_index([("created_by", 1), ("status", 1)])
    await seed_admin()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
