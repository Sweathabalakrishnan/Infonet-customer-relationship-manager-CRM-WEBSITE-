import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div>
        <h2 className="page-title">Welcome</h2>
        <p className="page-subtitle">
          {user?.name} ({user?.role})
        </p>
      </div>

      <button className="btn btn-danger" onClick={logout}>
        Logout
      </button>
    </header>
  );
}