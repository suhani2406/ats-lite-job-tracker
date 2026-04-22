"""Backend tests for ATS-Lite Job Tracker"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://job-pipeline-14.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": "admin@example.com", "password": "admin123"})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="module")
def new_user():
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{API}/auth/register", json={"name": "Test User", "email": email, "password": "Test123!"})
    assert r.status_code == 200, r.text
    data = r.json()
    return {"email": email, "password": "Test123!", "token": data["token"], "user": data["user"]}


# ---- Auth ----
class TestAuth:
    def test_register_returns_token_and_user(self, new_user):
        assert new_user["token"]
        assert new_user["user"]["email"] == new_user["email"]
        assert "id" in new_user["user"]

    def test_register_duplicate_email_400(self, new_user):
        r = requests.post(f"{API}/auth/register", json={"name": "Dup", "email": new_user["email"], "password": "Test123!"})
        assert r.status_code == 400

    def test_login_success(self, new_user):
        r = requests.post(f"{API}/auth/login", json={"email": new_user["email"], "password": new_user["password"]})
        assert r.status_code == 200
        assert "token" in r.json() and r.json()["user"]["email"] == new_user["email"]

    def test_login_wrong_password_401(self, new_user):
        r = requests.post(f"{API}/auth/login", json={"email": new_user["email"], "password": "wrong"})
        assert r.status_code == 401

    def test_me_requires_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token_401(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert r.status_code == 401

    def test_me_valid_token(self, new_user):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {new_user['token']}"})
        assert r.status_code == 200
        assert r.json()["email"] == new_user["email"]


# ---- Jobs CRUD ----
class TestJobs:
    def test_create_requires_auth(self):
        r = requests.post(f"{API}/jobs", json={"title": "X", "company": "Y"})
        assert r.status_code == 401

    def test_create_validates_required(self, new_user):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = requests.post(f"{API}/jobs", json={"title": ""}, headers=h)
        assert r.status_code == 422

    def test_create_default_status_applied(self, new_user):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = requests.post(f"{API}/jobs", json={"title": "SDE", "company": "Acme Corp", "location": "Remote"}, headers=h)
        assert r.status_code == 200
        j = r.json()
        assert j["status"] == "Applied"
        assert j["title"] == "SDE"
        # GET verify
        r2 = requests.get(f"{API}/jobs", headers=h)
        assert r2.status_code == 200
        assert any(x["id"] == j["id"] for x in r2.json()["items"])

    def test_list_structure_and_scoping(self, new_user, admin_headers):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        # Seed a few
        for i, st in enumerate(["Applied", "Interview", "Offer", "Rejected"]):
            requests.post(f"{API}/jobs", json={"title": f"Job{i}", "company": f"Co{i}", "status": st}, headers=h)
        r = requests.get(f"{API}/jobs", headers=h)
        assert r.status_code == 200
        data = r.json()
        for key in ["items", "total", "page", "page_size", "total_pages", "counts_by_status"]:
            assert key in data
        for s in ["All", "Applied", "Interview", "Offer", "Rejected"]:
            assert s in data["counts_by_status"]
        # Scoping: admin should not see user's jobs
        r_admin = requests.get(f"{API}/jobs", headers=admin_headers)
        user_ids = {x["id"] for x in data["items"]}
        admin_ids = {x["id"] for x in r_admin.json()["items"]}
        assert user_ids.isdisjoint(admin_ids)

    def test_filter_status(self, new_user):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = requests.get(f"{API}/jobs?status=Interview", headers=h)
        assert r.status_code == 200
        assert all(x["status"] == "Interview" for x in r.json()["items"])

    def test_pagination(self, new_user):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = requests.get(f"{API}/jobs?page=1&page_size=2", headers=h)
        assert r.status_code == 200
        d = r.json()
        assert d["page"] == 1 and d["page_size"] == 2 and len(d["items"]) <= 2

    def test_search_case_insensitive(self, new_user):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        requests.post(f"{API}/jobs", json={"title": "Backend", "company": "AcmeSearch"}, headers=h)
        r = requests.get(f"{API}/jobs?search=acmesearch", headers=h)
        assert r.status_code == 200
        assert len(r.json()["items"]) >= 1

    def test_patch_status_workflow(self, new_user):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = requests.post(f"{API}/jobs", json={"title": "Flow", "company": "Co"}, headers=h)
        jid = r.json()["id"]
        for st in ["Interview", "Offer", "Rejected"]:
            r2 = requests.patch(f"{API}/jobs/{jid}", json={"status": st}, headers=h)
            assert r2.status_code == 200 and r2.json()["status"] == st
        # Update multiple fields
        r3 = requests.patch(f"{API}/jobs/{jid}", json={"title": "NewT", "location": "NYC"}, headers=h)
        assert r3.status_code == 200 and r3.json()["title"] == "NewT" and r3.json()["location"] == "NYC"

    def test_patch_other_user_404(self, new_user, admin_headers):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = requests.post(f"{API}/jobs", json={"title": "Priv", "company": "C"}, headers=h)
        jid = r.json()["id"]
        r2 = requests.patch(f"{API}/jobs/{jid}", json={"status": "Offer"}, headers=admin_headers)
        assert r2.status_code == 404

    def test_delete_own_and_missing(self, new_user, admin_headers):
        h = {"Authorization": f"Bearer {new_user['token']}"}
        r = requests.post(f"{API}/jobs", json={"title": "Del", "company": "C"}, headers=h)
        jid = r.json()["id"]
        # Other user cannot delete
        r_forbidden = requests.delete(f"{API}/jobs/{jid}", headers=admin_headers)
        assert r_forbidden.status_code == 404
        # Owner deletes
        r2 = requests.delete(f"{API}/jobs/{jid}", headers=h)
        assert r2.status_code == 200
        # Verify 404 after delete
        r3 = requests.delete(f"{API}/jobs/{jid}", headers=h)
        assert r3.status_code == 404
