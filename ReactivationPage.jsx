import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaFileExcel, FaPlus, FaSyncAlt, FaUserCheck } from "react-icons/fa";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import FilterBar from "../components/FilterBar";
import EditModal from "../components/EditModal";
import AssignModal from "../components/AssignModal";
import { exportJsonToExcel } from "../utils/exportToExcel";
import { toDateInputValue } from "../utils/date";

export default function ReactivationPage() {
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
    week: "",
    assigned_to: "",
    customer_name: ""
  });

  const [form, setForm] = useState({
    month: "",
    week: "",
    ft_user_id: "",
    customer_id: "",
    customer_name: "",
    plan_amount: 0,
    activation_date: "",
    follow_status: "",
    zone_id: "",
    branch_id: ""
  });

  const [editRow, setEditRow] = useState(null);
  const [assignRow, setAssignRow] = useState(null);

  const canCreate = ["ADMIN", "SALES"].includes(user?.role);
  const canManage = ["ADMIN", "ZONE_MANAGER", "BRANCH_MANAGER"].includes(user?.role);

  const filteredBranches = useMemo(() => {
    if (!filters.zone_id) return branches;
    return branches.filter((b) => String(b.zone_id) === String(filters.zone_id));
  }, [branches, filters.zone_id]);

  const formBranches = useMemo(() => {
    if (!form.zone_id) return branches;
    return branches.filter((b) => String(b.zone_id) === String(form.zone_id));
  }, [branches, form.zone_id]);

  const editBranches = useMemo(() => {
    if (!editRow?.zone_id) return branches;
    return branches.filter((b) => String(b.zone_id) === String(editRow.zone_id));
  }, [branches, editRow]);

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

      const res = await apiRequest(`/api/react?${params.toString()}`);
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

      await apiRequest("/api/react", {
        method: "POST",
        body: {
          ...form,
          ft_user_id: form.ft_user_id || null,
          zone_id: form.zone_id || null,
          branch_id: form.branch_id || null,
          plan_amount: Number(form.plan_amount || 0),
          activation_date: form.activation_date || null
        }
      });

      setForm({
        month: "",
        week: "",
        ft_user_id: "",
        customer_id: "",
        customer_name: "",
        plan_amount: 0,
        activation_date: "",
        follow_status: "",
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

      await apiRequest(`/api/react/${editRow.id}`, {
        method: "PUT",
        body: {
          ...editRow,
          ft_user_id: editRow.ft_user_id || null,
          zone_id: editRow.zone_id || null,
          branch_id: editRow.branch_id || null,
          plan_amount: Number(editRow.plan_amount || 0),
          activation_date: editRow.activation_date || null
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

  function handleExport() {
    const zoneMap = Object.fromEntries(zones.map((z) => [String(z.id), z.zone_name]));
    const branchMap = Object.fromEntries(branches.map((b) => [String(b.id), b.branch_name]));
    const userMap = Object.fromEntries(users.map((u) => [String(u.id), u.name]));

    const exportRows = rows.map((row) => ({
      ID: row.id,
      "Customer ID": row.customer_id,
      Month: row.month,
      Week: row.week,
      "FT User": userMap[String(row.ft_user_id)] || row.ft_user_id || "",
      "Customer Name": row.customer_name,
      "Plan Amount": row.plan_amount,
      "Activation Date": row.activation_date,
      "Follow Status": row.follow_status,
      Zone: zoneMap[String(row.zone_id)] || row.zone_id || "",
      Branch: branchMap[String(row.branch_id)] || row.branch_id || "",
      "Assigned To": userMap[String(row.assigned_to)] || row.assigned_to || ""
    }));

    exportJsonToExcel(exportRows, "reactivation.xlsx", "Reactivation");
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
        onExport={handleExport}
      />

      <div className="card">
        <div className="section-header">
          <div className="title-with-icon">
            <FaSyncAlt />
            <h3>Reactivation</h3>
          </div>
          <div className="action-row">
            <button className="btn btn-secondary" onClick={() => loadData()}>
              Refresh
            </button>
            <button className="btn btn-success" onClick={handleExport}>
              <FaFileExcel /> Export
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
                  <th>Customer ID</th>
                  <th>Month</th>
                  <th>Week</th>
                  <th>Customer Name</th>
                  <th>Plan Amount</th>
                  <th>Activation Date</th>
                  <th>Follow Status</th>
                  <th>Zone</th>
                  <th>Branch</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.customer_id}</td>
                      <td>{row.month}</td>
                      <td>{row.week}</td>
                      <td>{row.customer_name}</td>
                      <td>{row.plan_amount}</td>
                      <td>{row.activation_date}</td>
                      <td>{row.follow_status}</td>
                      <td>{zones.find((z) => String(z.id) === String(row.zone_id))?.zone_name || "-"}</td>
                      <td>{branches.find((b) => String(b.id) === String(row.branch_id))?.branch_name || "-"}</td>
                      <td>
                        <div className="table-actions">
                          <button className="icon-btn" onClick={() => setEditRow({
                            ...row,
                            activation_date: toDateInputValue(row.activation_date)
                          })} title="Edit">
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
                  ))
                ) : (
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
            <h3>Add Reactivation</h3>
          </div>

          <form className="form-grid form-grid-wide" onSubmit={handleCreate}>
            <div>
              <label>Month</label>
              <input value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
            </div>

            <div>
              <label>Week</label>
              <input value={form.week} onChange={(e) => setForm({ ...form, week: e.target.value })} />
            </div>

            <div>
              <label>FT User</label>
              <select value={form.ft_user_id} onChange={(e) => setForm({ ...form, ft_user_id: e.target.value })}>
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Customer ID</label>
              <input
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                placeholder="Auto if empty"
              />
            </div>

            <div>
              <label>Customer Name</label>
              <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
            </div>

            <div>
              <label>Plan Amount</label>
              <input
                type="number"
                value={form.plan_amount}
                onChange={(e) => setForm({ ...form, plan_amount: e.target.value })}
              />
            </div>

            <div>
              <label>Activation Date</label>
              <input
                type="date"
                value={form.activation_date}
                onChange={(e) => setForm({ ...form, activation_date: e.target.value })}
              />
            </div>

            <div>
              <label>Follow Status</label>
              <select
                value={form.follow_status}
                onChange={(e) => setForm({ ...form, follow_status: e.target.value })}
              >
                <option value="">Select</option>
                <option value="PENDING">PENDING</option>
                <option value="ACHIEVED">ACHIEVED</option>
                <option value="FOLLOWING">FOLLOWING</option>
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
                  <option key={z.id} value={z.id}>
                    {z.zone_name}
                  </option>
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
                {formBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="full-width">
              <button className="btn btn-primary" type="submit">
                Save Reactivation
              </button>
            </div>
          </form>
        </div>
      )}

      <EditModal title="Edit Reactivation" open={!!editRow} onClose={() => setEditRow(null)}>
        {editRow && (
          <form className="form-grid form-grid-wide" onSubmit={handleEditSave}>
            <div>
              <label>Month</label>
              <input value={editRow.month || ""} onChange={(e) => setEditRow({ ...editRow, month: e.target.value })} />
            </div>

            <div>
              <label>Week</label>
              <input value={editRow.week || ""} onChange={(e) => setEditRow({ ...editRow, week: e.target.value })} />
            </div>

            <div>
              <label>FT User</label>
              <select
                value={editRow.ft_user_id || ""}
                onChange={(e) => setEditRow({ ...editRow, ft_user_id: e.target.value })}
              >
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Customer Name</label>
              <input
                value={editRow.customer_name || ""}
                onChange={(e) => setEditRow({ ...editRow, customer_name: e.target.value })}
              />
            </div>

            <div>
              <label>Plan Amount</label>
              <input
                type="number"
                value={editRow.plan_amount || 0}
                onChange={(e) => setEditRow({ ...editRow, plan_amount: e.target.value })}
              />
            </div>

            <div>
              <label>Activation Date</label>
              <input
                type="date"
                value={editRow.activation_date || ""}
                onChange={(e) => setEditRow({ ...editRow, activation_date: e.target.value })}
              />
            </div>

            <div>
              <label>Follow Status</label>
              <select
                value={editRow.follow_status || ""}
                onChange={(e) => setEditRow({ ...editRow, follow_status: e.target.value })}
              >
                <option value="">Select</option>
                <option value="PENDING">PENDING</option>
                <option value="ACHIEVED">ACHIEVED</option>
                <option value="FOLLOWING">FOLLOWING</option>
              </select>
            </div>

            <div>
              <label>Zone</label>
              <select
                value={editRow.zone_id || ""}
                onChange={(e) => setEditRow({ ...editRow, zone_id: e.target.value, branch_id: "" })}
              >
                <option value="">Select Zone</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.zone_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Branch</label>
              <select
                value={editRow.branch_id || ""}
                onChange={(e) => setEditRow({ ...editRow, branch_id: e.target.value })}
              >
                <option value="">Select Branch</option>
                {editBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="full-width">
              <button className="btn btn-primary" type="submit">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </EditModal>

      <AssignModal
        open={!!assignRow}
        onClose={() => setAssignRow(null)}
        endpoint="/api/react"
        recordId={assignRow?.id}
        users={users.filter((u) => ["SALES", "TECH"].includes(u.role))}
        onDone={loadData}
      />
    </div>
  );
}