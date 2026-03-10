import { useEffect, useMemo, useState } from "react";
import { FaUsers, FaPlus } from "react-icons/fa";
import { apiRequest } from "../api/client";

export default function Users() {
  const [rows, setRows] = useState([]);
  const [zones, setZones] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "SALES",
    zone_id: "",
    branch_id: "",
    mobile: "",
    email: ""
  });

  const filteredBranches = useMemo(() => {
    if (!form.zone_id) return branches;
    return branches.filter((b) => String(b.zone_id) === String(form.zone_id));
  }, [branches, form.zone_id]);

  async function loadMasters() {
    try {
      const [z, b] = await Promise.all([
        apiRequest("/api/master/zones"),
        apiRequest("/api/master/branches")
      ]);
      setZones(z.data || []);
      setBranches(b.data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadUsers() {
    try {
      const res = await apiRequest("/api/users");
      setRows(res.data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadMasters();
    loadUsers();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await apiRequest("/api/users", {
        method: "POST",
        body: {
          ...form,
          zone_id: form.zone_id || null,
          branch_id: form.branch_id || null
        }
      });

      setForm({
        name: "",
        username: "",
        password: "",
        role: "SALES",
        zone_id: "",
        branch_id: "",
        mobile: "",
        email: ""
      });

      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-grid">
      <div className="card">
        <div className="title-with-icon">
          <FaPlus />
          <h3>Create User</h3>
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        <form className="form-grid form-grid-wide" onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label>Username</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>

          <div>
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          <div>
            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="ADMIN">ADMIN</option>
              <option value="ZONE_MANAGER">ZONE_MANAGER</option>
              <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
              <option value="SALES">SALES</option>
              <option value="TECH">TECH</option>
            </select>
          </div>

          <div>
            <label>Zone</label>
            <select
              value={form.zone_id}
              onChange={(e) => setForm({ ...form, zone_id: e.target.value, branch_id: "" })}
            >
              <option value="">Select Zone</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.zone_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Branch</label>
            <select
              value={form.branch_id}
              onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
            >
              <option value="">Select Branch</option>
              {filteredBranches.map((b) => (
                <option key={b.id} value={b.id}>{b.branch_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Mobile</label>
            <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </div>

          <div>
            <label>Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="full-width">
            <button className="btn btn-primary" type="submit">Create User</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="title-with-icon">
            <FaUsers />
            <h3>Users List</h3>
          </div>
          <button className="btn btn-secondary" onClick={loadUsers}>Refresh</button>
        </div>

        <div className="table-wrap">
          <table className="pretty-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Zone</th>
                <th>Branch</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? rows.map((row) => {
                const zone = zones.find((z) => String(z.id) === String(row.zone_id));
                const branch = branches.find((b) => String(b.id) === String(row.branch_id));
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{row.username}</td>
                    <td>{row.role}</td>
                    <td>{zone?.zone_name || "-"}</td>
                    <td>{branch?.branch_name || "-"}</td>
                    <td>{row.mobile}</td>
                    <td>{row.email}</td>
                    <td>{row.is_active ? "Yes" : "No"}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="9">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}