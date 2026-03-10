import { useEffect, useState } from "react";
import { FaEdit, FaFileExcel, FaPlus, FaTasks } from "react-icons/fa";
import { apiRequest } from "../api/client";
import EditModal from "../components/EditModal";
import { exportJsonToExcel } from "../utils/exportToExcel";
import { toDateTimeLocalValue } from "../utils/date";

export default function TasksPage() {
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const [filters, setFilters] = useState({
    assigned_to: "",
    status: "",
    module_name: "",
    from_date: "",
    to_date: ""
  });

  const [form, setForm] = useState({
    module_name: "TECH_REF",
    record_id: "",
    assigned_to: "",
    followup_date: "",
    note: "",
    status: "OPEN"
  });

  async function loadMasters() {
    try {
      const u = await apiRequest("/api/master/users-lite");
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

      const res = await apiRequest(`/api/tasks?${params.toString()}`);
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
      await apiRequest("/api/tasks", {
        method: "POST",
        body: {
          ...form,
          record_id: Number(form.record_id),
          assigned_to: Number(form.assigned_to)
        }
      });

      setForm({
        module_name: "TECH_REF",
        record_id: "",
        assigned_to: "",
        followup_date: "",
        note: "",
        status: "OPEN"
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
      await apiRequest(`/api/tasks/${editRow.id}`, {
        method: "PUT",
        body: {
          ...editRow,
          assigned_to: Number(editRow.assigned_to)
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
      assigned_to: "",
      status: "",
      module_name: "",
      from_date: "",
      to_date: ""
    };
    setFilters(next);
    loadData(next);
  }

  function handleExport() {
    const userMap = Object.fromEntries(users.map((u) => [String(u.id), u.name]));

    const exportRows = rows.map((row) => ({
      ID: row.id,
      Module: row.module_name,
      "Record ID": row.record_id,
      "Assigned To": userMap[String(row.assigned_to)] || row.assigned_to,
      "Followup Date": row.followup_date,
      Note: row.note,
      Status: row.status
    }));

    exportJsonToExcel(exportRows, "tasks.xlsx", "Tasks");
  }

  return (
    <div className="page-stack">
      <div className="card">
        <div className="filter-bar-top">
          <div className="filter-title">
            <FaTasks />
            <span>Task Filters</span>
          </div>
        </div>

        <div className="filter-grid">
          <div>
            <label>Assigned User</label>
            <select
              value={filters.assigned_to}
              onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Module</label>
            <select
              value={filters.module_name}
              onChange={(e) => setFilters({ ...filters, module_name: e.target.value })}
            >
              <option value="">All Modules</option>
              <option value="TECH_REF">TECH_REF</option>
              <option value="L2">L2</option>
              <option value="NEW_CONN">NEW_CONN</option>
              <option value="REACT">REACT</option>
              <option value="UPSELL">UPSELL</option>
            </select>
          </div>

          <div>
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="OPEN">OPEN</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          <div>
            <label>From Date</label>
            <input
              type="date"
              value={filters.from_date}
              onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
            />
          </div>

          <div>
            <label>To Date</label>
            <input
              type="date"
              value={filters.to_date}
              onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn btn-primary" onClick={() => loadData(filters)}>
            Apply
          </button>
          <button className="btn btn-secondary" onClick={resetFilters}>
            Reset
          </button>
          <button className="btn btn-success" onClick={handleExport}>
            <FaFileExcel /> Export
          </button>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="title-with-icon">
            <FaTasks />
            <h3>Tasks / Follow-ups</h3>
          </div>
          <button className="btn btn-secondary" onClick={() => loadData()}>
            Refresh
          </button>
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
                  <th>Module</th>
                  <th>Record ID</th>
                  <th>Assigned To</th>
                  <th>Followup Date</th>
                  <th>Note</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.module_name}</td>
                      <td>{row.record_id}</td>
                      <td>{users.find((u) => String(u.id) === String(row.assigned_to))?.name || row.assigned_to}</td>
                      <td>{row.followup_date}</td>
                      <td>{row.note}</td>
                      <td>
                        <span className={`status-pill ${String(row.status || "OPEN").toLowerCase()}`}>
                          {row.status || "OPEN"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-btn"
                            onClick={() =>
                              setEditRow({
                                ...row,
                                followup_date: toDateTimeLocalValue(row.followup_date)
                              })
                            }
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No tasks found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="title-with-icon">
          <FaPlus />
          <h3>Add Task</h3>
        </div>

        <form className="form-grid form-grid-wide" onSubmit={handleCreate}>
          <div>
            <label>Module</label>
            <select value={form.module_name} onChange={(e) => setForm({ ...form, module_name: e.target.value })}>
              <option value="TECH_REF">TECH_REF</option>
              <option value="L2">L2</option>
              <option value="NEW_CONN">NEW_CONN</option>
              <option value="REACT">REACT</option>
              <option value="UPSELL">UPSELL</option>
            </select>
          </div>

          <div>
            <label>Record ID</label>
            <input
              type="number"
              value={form.record_id}
              onChange={(e) => setForm({ ...form, record_id: e.target.value })}
            />
          </div>

          <div>
            <label>Assigned To</label>
            <select
              value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
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
            <label>Follow-up Date</label>
            <input
              type="datetime-local"
              value={form.followup_date}
              onChange={(e) => setForm({ ...form, followup_date: e.target.value })}
            />
          </div>

          <div>
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="OPEN">OPEN</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          <div className="full-width">
            <label>Note</label>
            <textarea
              rows="4"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          <div className="full-width">
            <button className="btn btn-primary" type="submit">
              Save Task
            </button>
          </div>
        </form>
      </div>

      <EditModal title="Edit Task" open={!!editRow} onClose={() => setEditRow(null)}>
        {editRow && (
          <form className="form-grid form-grid-wide" onSubmit={handleEditSave}>
            <div>
              <label>Assigned To</label>
              <select
                value={editRow.assigned_to || ""}
                onChange={(e) => setEditRow({ ...editRow, assigned_to: e.target.value })}
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
              <label>Follow-up Date</label>
              <input
                type="datetime-local"
                value={editRow.followup_date || ""}
                onChange={(e) => setEditRow({ ...editRow, followup_date: e.target.value })}
              />
            </div>

            <div>
              <label>Status</label>
              <select
                value={editRow.status || "OPEN"}
                onChange={(e) => setEditRow({ ...editRow, status: e.target.value })}
              >
                <option value="OPEN">OPEN</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

            <div className="full-width">
              <label>Note</label>
              <textarea
                rows="4"
                value={editRow.note || ""}
                onChange={(e) => setEditRow({ ...editRow, note: e.target.value })}
              />
            </div>

            <div className="full-width">
              <button className="btn btn-primary" type="submit">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </EditModal>
    </div>
  );
}