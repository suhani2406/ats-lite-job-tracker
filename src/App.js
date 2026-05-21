import "./App.css";

export default function App() {
  const stats = [
    ["TOTAL", 1],
    ["APPLIED", 1],
    ["INTERVIEW", 0],
    ["OFFER", 0],
    ["REJECTED", 0],
  ];

  return (
    <div className="app">
      <nav className="topbar">
        <div className="brand">
          🎯 <div><b>ATS-Lite</b><span>JOB TRACKER</span></div>
        </div>

        <button className="addBtn">+ Add Job</button>
      </nav>

      <main>
        <p className="eyebrow">YOUR PIPELINE</p>
        <h1>Hi, Suhani.</h1>
        <p className="sub">1 total application tracked.</p>

        <section className="stats">
          {stats.map(([label, value]) => (
            <div className="stat" key={label}>
              <p>{label}</p>
              <h2>{value}</h2>
            </div>
          ))}
        </section>

        <div className="card">
          <h2>Web Development</h2>
          <p>Tripple One Solutions</p>
          <p>Work from home</p>
          <p>Applied 22 Apr 2026</p>
        </div>
      </main>
    </div>
  );
}