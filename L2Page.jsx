import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaProjectDiagram, FaUserCheck } from "react-icons/fa";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import FilterBar from "../components/FilterBar";
import EditModal from "../components/EditModal";
import AssignModal from "../components/AssignModal";
import { toDateInputValue, toDateTimeLocalValue } from "../utils/date";

export default function L2Page() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [zones, setZones] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    zone_id: "",
    branch_id: "",
    month: "",
    assigned_to: "",
    customer_name: ""
  });

  const [form, setForm] = useState({
    ticket_id: "",
    date: new Date().toISOString().slice(0, 10),
    customer_name: "",
    mobile: "",
    location: "",
    sales_person_id: "",
    l2_status: "",
    order_status: "",
    sales_follow_status: "",
    last_discussion_time: "",
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
      const [z, b, u] = await Promise.all([
        apiRequest("/api/master/zones"),
        apiRequest("/api/master/branches"),
        apiRequest("/api/master/users-lite")
      ]);
      setZones(z.data || []);
      setBranches(b.data || []);
      setUsers(u.data || []);
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

      const res = await apiRequest(`/api/l2?${params.toString()}`);
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
      await apiRequest("/api/l2", {
        method: "POST",
        body: {
          ...form,
          sales_person_id: form.sales_person_id || null,
          zone_id: form.zone_id || null,
          branch_id: form.branch_id || null,
          last_discussion_time: form.last_discussion_time || null
        }
      });

      setForm({
        ticket_id: "",
        date: new Date().toISOString().slice(0, 10),
        customer_name: "",
        mobile: "",
        location: "",
        sales_person_id: "",
        l2_status: "",
        order_status: "",
        sales_follow_status: "",
        last_discussion_time: "",
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
      await apiRequest(`/api/l2/${editRow.id}`, {
        method: "PUT",
        body: editRow
      });
      setEditRow(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetFilters() {
    const next = { zone_id: "", branch_id: "", month: "", assigned_to: "", customer_name: "" };
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
        showWeek={false}
      />

      <div className="card">
        <div className="section-header">
          <div className="title-with-icon">
            <FaProjectDiagram />
            <h3>L2 Feasibility</h3>
          </div>
          <button className="btn btn-secondary" onClick={() => loadData()}>Refresh</button>
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
                  <th>Ticket ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Location</th>
                  <th>L2 Status</th>
                  <th>Order Status</th>
                  <th>Follow Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.ticket_id}</td>
                    <td>{row.date}</td>
                    <td>{row.customer_name}</td>
                    <td>{row.mobile}</td>
                    <td>{row.location}</td>
                    <td>{row.l2_status}</td>
                    <td>{row.order_status}</td>
                    <td>{row.sales_follow_status}</td>
                    <td>
                      <div className="table-actions">
                        <button className="icon-btn" onClick={() => setEditRow({
                          ...row,
                          date: toDateInputValue(row.date),
                          last_discussion_time: toDateTimeLocalValue(row.last_discussion_time)
                        })}>
                          <FaEdit />
                        </button>
                        {canManage && (
                          <button className="icon-btn" onClick={() => setAssignRow(row)}>
                            <FaUserCheck />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="10">No records found</td></tr>
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
            <h3>Add L2 Record</h3>
          </div>

          <form className="form-grid form-grid-wide" onSubmit={handleCreate}>
            <div><label>Ticket ID</label><input value={form.ticket_id} onChange={(e) => setForm({ ...form, ticket_id: e.target.value })} placeholder="Auto if empty" /></div>
            <div><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><label>Customer Name</label><input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></div>
            <div><label>Mobile</label><input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></div>
            <div><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div><label>Sales Person</label>
              <select value={form.sales_person_id} onChange={(e) => setForm({ ...form, sales_person_id: e.target.value })}>
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div><label>L2 Status</label>
              <select value={form.l2_status} onChange={(e) => setForm({ ...form, l2_status: e.target.value })}>
                <option value="">Select</option>
                <option value="FEASIBLE">FEASIBLE</option>
                <option value="NOT_FEASIBLE">NOT_FEASIBLE</option>
              </select>
            </div>
            <div><label>Order Status</label><input value={form.order_status} onChange={(e) => setForm({ ...form, order_status: e.target.value })} /></div>
            <div><label>Zone</label>
              <select value={form.zone_id} onChange={(e) => setForm({ ...form, zone_id: e.target.value, branch_id: "" })}>
                <option value="">Select Zone</option>
                {zones.map((z) => <option key={z.id} value={z.id}>{z.zone_name}</option>)}
              </select>
            </div>
            <div><label>Branch</label>
              <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}>
                <option value="">Select Branch</option>
                {branches
                  .filter((b) => !form.zone_id || String(b.zone_id) === String(form.zone_id))
                  .map((b) => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
              </select>
            </div>
            <div><label>Follow Status</label><input value={form.sales_follow_status} onChange={(e) => setForm({ ...form, sales_follow_status: e.target.value })} /></div>
            <div><label>Last Discussion</label><input type="datetime-local" value={form.last_discussion_time} onChange={(e) => setForm({ ...form, last_discussion_time: e.target.value })} /></div>
            <div className="full-width"><button className="btn btn-primary" type="submit">Save L2</button></div>
          </form>
        </div>
      )}

      <EditModal title="Edit L2 Record" open={!!editRow} onClose={() => setEditRow(null)}>
        {editRow && (
          <form className="form-grid form-grid-wide" onSubmit={handleEditSave}>
            <div><label>Date</label><input type="date" value={editRow.date || ""} onChange={(e) => setEditRow({ ...editRow, date: e.target.value })} /></div>
            <div><label>Customer Name</label><input value={editRow.customer_name || ""} onChange={(e) => setEditRow({ ...editRow, customer_name: e.target.value })} /></div>
            <div><label>Mobile</label><input value={editRow.mobile || ""} onChange={(e) => setEditRow({ ...editRow, mobile: e.target.value })} /></div>
            <div><label>Location</label><input value={editRow.location || ""} onChange={(e) => setEditRow({ ...editRow, location: e.target.value })} /></div>
            <div><label>L2 Status</label><input value={editRow.l2_status || ""} onChange={(e) => setEditRow({ ...editRow, l2_status: e.target.value })} /></div>
            <div><label>Order Status</label><input value={editRow.order_status || ""} onChange={(e) => setEditRow({ ...editRow, order_status: e.target.value })} /></div>
            <div><label>Follow Status</label><input value={editRow.sales_follow_status || ""} onChange={(e) => setEditRow({ ...editRow, sales_follow_status: e.target.value })} /></div>
            <div><label>Last Discussion</label><input type="datetime-local" value={editRow.last_discussion_time || ""} onChange={(e) => setEditRow({ ...editRow, last_discussion_time: e.target.value })} /></div>
            <div className="full-width"><button className="btn btn-primary" type="submit">Save Changes</button></div>
          </form>
        )}
      </EditModal>

      <AssignModal
        open={!!assignRow}
        onClose={() => setAssignRow(null)}
        endpoint="/api/l2"
        recordId={assignRow?.id}
        users={users.filter((u) => ["SALES", "TECH"].includes(u.role))}
        onDone={loadData}
      />
    </div>
  );
}