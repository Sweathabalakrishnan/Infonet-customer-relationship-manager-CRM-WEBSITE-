import { useEffect, useMemo, useState } from "react";
import { FaArrowUp, FaEdit, FaFileExcel, FaPlus, FaUserCheck } from "react-icons/fa";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import FilterBar from "../components/FilterBar";
import EditModal from "../components/EditModal";
import AssignModal from "../components/AssignModal";
import { exportJsonToExcel } from "../utils/exportToExcel";

export default function UpsellPage() {
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
    month: "",
    week: "",
    ft_user_id: "",
    lead_id: "",
    customer_id: "",
    customer_name: "",
    current_plan: "",
    current_plan_amount: 0,
    current_payment_mode: "",
    change_plan: "",
    change_plan_amount: 0,
    change_payment_mode: "",
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

      const res = await apiRequest(`/api/upsell?${params.toString()}`);
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

      await apiRequest("/api/upsell", {
        method: "POST",
        body: {
          ...form,
          ft_user_id: form.ft_user_id || null,
          zone_id: form.zone_id || null,
          branch_id: form.branch_id || null,
          current_plan_amount: Number(form.current_plan_amount || 0),
          change_plan_amount: Number(form.change_plan_amount || 0)
        }
      });

      setForm({
        month: "",
        week: "",
        ft_user_id: "",
        lead_id: "",
        customer_id: "",
        customer_name: "",
        current_plan: "",
        current_plan_amount: 0,
        current_payment_mode: "",
        change_plan: "",
        change_plan_amount: 0,
        change_payment_mode: "",
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

      await apiRequest(`/api/upsell/${editRow.id}`, {
        method: "PUT",
        body: {
          ...editRow,
          ft_user_id: editRow.ft_user_id || null,
          zone_id: editRow.zone_id || null,
          branch_id: editRow.branch_id || null,
          current_plan_amount: Number(editRow.current_plan_amount || 0),
          change_plan_amount: Number(editRow.change_plan_amount || 0)
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
      "Lead ID": row.lead_id,
      Month: row.month,
      Week: row.week,
      "FT User": userMap[String(row.ft_user_id)] || row.ft_user_id || "",
      "Customer ID": row.customer_id,
      "Customer Name": row.customer_name,
      "Current Plan": row.current_plan,
      "Current Amount": row.current_plan_amount,
      "Current Payment Mode": row.current_payment_mode,
      "Change Plan": row.change_plan,
      "Change Amount": row.change_plan_amount,
      "Change Payment Mode": row.change_payment_mode,
      Difference: row.difference,
      Zone: zoneMap[String(row.zone_id)] || row.zone_id || "",
      Branch: branchMap[String(row.branch_id)] || row.branch_id || "",
      "Assigned To": userMap[String(row.assigned_to)] || row.assigned_to || ""
    }));

    exportJsonToExcel(exportRows, "upsell.xlsx", "Upsell");
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
            <FaArrowUp />
            <h3>Upsell</h3>
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
                  <th>Lead ID</th>
                  <th>Month</th>
                  <th>Week</th>
                  <th>Customer</th>
                  <th>Current Plan</th>
                  <th>Current Amount</th>
                  <th>Change Plan</th>
                  <th>Change Amount</th>
                  <th>Difference</th>
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
                      <td>{row.lead_id}</td>
                      <td>{row.month}</td>
                      <td>{row.week}</td>
                      <td>{row.customer_name}</td>
                      <td>{row.current_plan}</td>
                      <td>{row.current_plan_amount}</td>
                      <td>{row.change_plan}</td>
                      <td>{row.change_plan_amount}</td>
                      <td>{row.difference}</td>
                      <td>{zones.find((z) => String(z.id) === String(row.zone_id))?.zone_name || "-"}</td>
                      <td>{branches.find((b) => String(b.id) === String(row.branch_id))?.branch_name || "-"}</td>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="13">No records found</td>
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
            <h3>Add Upsell</h3>
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
              <label>Lead ID</label>
              <input
                value={form.lead_id}
                onChange={(e) => setForm({ ...form, lead_id: e.target.value })}
                placeholder="Auto if empty"
              />
            </div>

            <div>
              <label>Customer ID</label>
              <input value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} />
            </div>

            <div>
              <label>Customer Name</label>
              <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
            </div>

            <div>
              <label>Current Plan</label>
              <select
                value={form.current_plan}
                onChange={(e) => {
                  const selected = plans.find((p) => p.plan_name === e.target.value);
                  setForm({
                    ...form,
                    current_plan: e.target.value,
                    current_plan_amount: selected ? selected.plan_amount : 0
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
              <label>Current Amount</label>
              <input
                type="number"
                value={form.current_plan_amount}
                onChange={(e) => setForm({ ...form, current_plan_amount: e.target.value })}
              />
            </div>

            <div>
              <label>Current Payment Mode</label>
              <select
                value={form.current_payment_mode}
                onChange={(e) => setForm({ ...form, current_payment_mode: e.target.value })}
              >
                <option value="">Select</option>
                <option value="HRC">HRC</option>
                <option value="CASH">CASH</option>
                <option value="ONLINE">ONLINE</option>
              </select>
            </div>

            <div>
              <label>Change Plan</label>
              <select
                value={form.change_plan}
                onChange={(e) => {
                  const selected = plans.find((p) => p.plan_name === e.target.value);
                  setForm({
                    ...form,
                    change_plan: e.target.value,
                    change_plan_amount: selected ? selected.plan_amount : 0
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
              <label>Change Amount</label>
              <input
                type="number"
                value={form.change_plan_amount}
                onChange={(e) => setForm({ ...form, change_plan_amount: e.target.value })}
              />
            </div>

            <div>
              <label>Change Payment Mode</label>
              <select
                value={form.change_payment_mode}
                onChange={(e) => setForm({ ...form, change_payment_mode: e.target.value })}
              >
                <option value="">Select</option>
                <option value="HRC">HRC</option>
                <option value="CASH">CASH</option>
                <option value="ONLINE">ONLINE</option>
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
                Save Upsell
              </button>
            </div>
          </form>
        </div>
      )}

      <EditModal title="Edit Upsell" open={!!editRow} onClose={() => setEditRow(null)}>
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
              <label>Current Plan</label>
              <select
                value={editRow.current_plan || ""}
                onChange={(e) => {
                  const selected = plans.find((p) => p.plan_name === e.target.value);
                  setEditRow({
                    ...editRow,
                    current_plan: e.target.value,
                    current_plan_amount: selected ? selected.plan_amount : editRow.current_plan_amount
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
              <label>Current Amount</label>
              <input
                type="number"
                value={editRow.current_plan_amount || 0}
                onChange={(e) => setEditRow({ ...editRow, current_plan_amount: e.target.value })}
              />
            </div>

            <div>
              <label>Current Payment Mode</label>
              <select
                value={editRow.current_payment_mode || ""}
                onChange={(e) => setEditRow({ ...editRow, current_payment_mode: e.target.value })}
              >
                <option value="">Select</option>
                <option value="HRC">HRC</option>
                <option value="CASH">CASH</option>
                <option value="ONLINE">ONLINE</option>
              </select>
            </div>

            <div>
              <label>Change Plan</label>
              <select
                value={editRow.change_plan || ""}
                onChange={(e) => {
                  const selected = plans.find((p) => p.plan_name === e.target.value);
                  setEditRow({
                    ...editRow,
                    change_plan: e.target.value,
                    change_plan_amount: selected ? selected.plan_amount : editRow.change_plan_amount
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
              <label>Change Amount</label>
              <input
                type="number"
                value={editRow.change_plan_amount || 0}
                onChange={(e) => setEditRow({ ...editRow, change_plan_amount: e.target.value })}
              />
            </div>

            <div>
              <label>Change Payment Mode</label>
              <select
                value={editRow.change_payment_mode || ""}
                onChange={(e) => setEditRow({ ...editRow, change_payment_mode: e.target.value })}
              >
                <option value="">Select</option>
                <option value="HRC">HRC</option>
                <option value="CASH">CASH</option>
                <option value="ONLINE">ONLINE</option>
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
        endpoint="/api/upsell"
        recordId={assignRow?.id}
        users={users.filter((u) => ["SALES", "TECH"].includes(u.role))}
        onDone={loadData}
      />
    </div>
  );
}