import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaTasks, FaUserCheck } from "react-icons/fa";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import FilterBar from "../components/FilterBar";
import EditModal from "../components/EditModal";
import AssignModal from "../components/AssignModal";

export default function TechRefLeads() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [zones, setZones] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    zone_id: "",
    branch_id: "",
    month: "",
    week: "",
    assigned_to: "",
    customer_name: ""
  });

  const [form, setForm] = useState({
    tech_ref_id: "",
    lead_date: new Date().toISOString().slice(0, 10),
    customer_name: "",
    mobile: "",
    location: "",
    plan: "",
    plan_value: 0,
    sales_follow_status: "",
    updates: "",
    zone_id: "",
    branch_id: ""
  });

  const [editRow, setEditRow] = useState(null);
  const [assignRow, setAssignRow] = useState(null);

  const canCreate = ["ADMIN", "TECH"].includes(user?.role);
  const canManage = ["ADMIN", "ZONE_MANAGER", "BRANCH_MANAGER"].includes(user?.role);

  const filteredBranches = useMemo(() => {
    if (!filters.zone_id) return branches;
    return branches.filter((b) => String(b.zone_id) === String(filters.zone_id));
  }, [branches, filters.zone_id]);

  async function loadMasters() {
    try {
      const [z, b, u, p] = await Promise.all([
        apiRequest("/api/master/zones"),
        apiRequest("/api/master/branches"),
        apiRequest("/api/master/users-lite"),
        apiRequest("/api/master/plans")
      ]);
      setZones(z.data || []);
      setBranches(b.data || []);
      setUsers(u.data || []);
      setPlans(p.data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadData(customFilters = filters) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      Object.entries(customFilters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const res = await apiRequest(`/api/tech-ref-leads?${params.toString()}`);
      setRows(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMasters();
    loadData();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      setError("");
      await apiRequest("/api/tech-ref-leads", {
        method: "POST",
        body: {
          ...form,
          zone_id: form.zone_id || null,
          branch_id: form.branch_id || null,
          plan_value: Number(form.plan_value || 0)
        }
      });

      setForm({
        tech_ref_id: "",
        lead_date: new Date().toISOString().slice(0, 10),
        customer_name: "",
        mobile: "",
        location: "",
        plan: "",
        plan_value: 0,
        sales_follow_status: "",
        updates: "",
        zone_id: "",
        branch_id: ""
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEditSave(e) {
    e.preventDefault();
    try {
      setError("");
      await apiRequest(`/api/tech-ref-leads/${editRow.id}`, {
        method: "PUT",
        body: {
          ...editRow,
          plan_value: Number(editRow.plan_value || 0)
        }
      });
      setEditRow(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetFilters() {
    const next = {
      zone_id: "",
      branch_id: "",
      month: "",
      week: "",
      assigned_to: "",
      customer_name: ""
    };
    setFilters(next);
    loadData(next);
  }

  return (
    <div className="page-stack">
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        zones={zones}
        branches={filteredBranches}
        users={users}
        onApply={() => loadData(filters)}
        onReset={resetFilters}
      />

      <div className="card">
        <div className="section-header">
          <div className="title-with-icon">
            <FaTasks />
            <h3>Tech Ref Leads</h3>
          </div>

          <div className="action-row">
            <button className="btn btn-secondary" onClick={() => loadData()}>
              Refresh
            </button>
          </div>
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-wrap">
            <table className="pretty-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ref ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Location</th>
                  <th>Plan</th>
                  <th>Value</th>
                  <th>Follow Status</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.tech_ref_id}</td>
                    <td>{row.lead_date}</td>
                    <td>{row.customer_name}</td>
                    <td>{row.mobile}</td>
                    <td>{row.location}</td>
                    <td>{row.plan}</td>
                    <td>{row.plan_value}</td>
                    <td>{row.sales_follow_status}</td>
                    <td>
                      <span className={`status-pill ${String(row.status || "OPEN").toLowerCase()}`}>
                        {row.status || "OPEN"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="icon-btn" onClick={() => setEditRow(row)} title="Edit">
                          <FaEdit />
                        </button>

                        {canManage && (
                          <button className="icon-btn" onClick={() => setAssignRow(row)} title="Assign">
                            <FaUserCheck />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="11">No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canCreate && (
        <div className="card">
          <div className="title-with-icon">
            <FaPlus />
            <h3>Add Tech Ref Lead</h3>
          </div>

          <form className="form-grid form-grid-wide" onSubmit={handleCreate}>
            <div>
              <label>Tech Ref ID</label>
              <input
                value={form.tech_ref_id}
                onChange={(e) => setForm({ ...form, tech_ref_id: e.target.value })}
                placeholder="Auto if empty"
              />
            </div>

            <div>
              <label>Lead Date</label>
              <input
                type="date"
                value={form.lead_date}
                onChange={(e) => setForm({ ...form, lead_date: e.target.value })}
              />
            </div>

            <div>
              <label>Customer Name</label>
              <input
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              />
            </div>

            <div>
              <label>Mobile</label>
              <input
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </div>

            <div>
              <label>Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div>
              <label>Plan</label>
              <select
                value={form.plan}
                onChange={(e) => {
                  const selected = plans.find((p) => p.plan_name === e.target.value);
                  setForm({
                    ...form,
                    plan: e.target.value,
                    plan_value: selected ? selected.plan_amount : 0
                  });
                }}
              >
                <option value="">Select Plan</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.plan_name}>
                    {p.plan_name} - {p.plan_amount}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Plan Value</label>
              <input
                type="number"
                value={form.plan_value}
                onChange={(e) => setForm({ ...form, plan_value: e.target.value })}
              />
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
                {branches
                  .filter((b) => !form.zone_id || String(b.zone_id) === String(form.zone_id))
                  .map((b) => (
                    <option key={b.id} value={b.id}>{b.branch_name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label>Sales Follow Status</label>
              <input
                value={form.sales_follow_status}
                onChange={(e) => setForm({ ...form, sales_follow_status: e.target.value })}
              />
            </div>

            <div className="full-width">
              <label>Updates</label>
              <textarea
                rows="4"
                value={form.updates}
                onChange={(e) => setForm({ ...form, updates: e.target.value })}
              />
            </div>

            <div className="full-width">
              <button className="btn btn-primary" type="submit">
                Save Lead
              </button>
            </div>
          </form>
        </div>
      )}

      <EditModal title="Edit Tech Ref Lead" open={!!editRow} onClose={() => setEditRow(null)}>
        {editRow && (
          <form className="form-grid form-grid-wide" onSubmit={handleEditSave}>
            <div>
              <label>Customer Name</label>
              <input
                value={editRow.customer_name || ""}
                onChange={(e) => setEditRow({ ...editRow, customer_name: e.target.value })}
              />
            </div>

            <div>
              <label>Mobile</label>
              <input
                value={editRow.mobile || ""}
                onChange={(e) => setEditRow({ ...editRow, mobile: e.target.value })}
              />
            </div>

            <div>
              <label>Location</label>
              <input
                value={editRow.location || ""}
                onChange={(e) => setEditRow({ ...editRow, location: e.target.value })}
              />
            </div>

            <div>
              <label>Plan</label>
              <input
                value={editRow.plan || ""}
                onChange={(e) => setEditRow({ ...editRow, plan: e.target.value })}
              />
            </div>

            <div>
              <label>Plan Value</label>
              <input
                type="number"
                value={editRow.plan_value || 0}
                onChange={(e) => setEditRow({ ...editRow, plan_value: e.target.value })}
              />
            </div>

            <div>
              <label>Follow Status</label>
              <input
                value={editRow.sales_follow_status || ""}
                onChange={(e) => setEditRow({ ...editRow, sales_follow_status: e.target.value })}
              />
            </div>

            <div className="full-width">
              <label>Updates</label>
              <textarea
                rows="4"
                value={editRow.updates || ""}
                onChange={(e) => setEditRow({ ...editRow, updates: e.target.value })}
              />
            </div>

            <div>
              <label>Status</label>
              <select
                value={editRow.status || "OPEN"}
                onChange={(e) => setEditRow({ ...editRow, status: e.target.value })}
              >
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div className="full-width">
              <button className="btn btn-primary" type="submit">Save Changes</button>
            </div>
          </form>
        )}
      </EditModal>

      <AssignModal
        open={!!assignRow}
        onClose={() => setAssignRow(null)}
        endpoint="/api/tech-ref-leads"
        recordId={assignRow?.id}
        users={users.filter((u) => ["SALES", "TECH"].includes(u.role))}
        onDone={loadData}
      />
    </div>
  );
}