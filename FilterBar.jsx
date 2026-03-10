import { FaFilter, FaSearch, FaUndo, FaFileExcel } from "react-icons/fa";

export default function FilterBar({
  filters,
  setFilters,
  zones = [],
  branches = [],
  users = [],
  onApply,
  onReset,
  onExport,
  showMonth = true,
  showWeek = true,
  showUser = true,
  showName = true
}) {
  return (
    <div className="filter-bar card">
      <div className="filter-bar-top">
        <div className="filter-title">
          <FaFilter />
          <span>Filters</span>
        </div>
      </div>

      <div className="filter-grid">
        <div>
          <label>Zone</label>
          <select
            value={filters.zone_id || ""}
            onChange={(e) => setFilters({ ...filters, zone_id: e.target.value, branch_id: "" })}
          >
            <option value="">All Zones</option>
            {(zones || []).map((z) => (
              <option key={z.id} value={z.id}>
                {z.zone_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Branch</label>
          <select
            value={filters.branch_id || ""}
            onChange={(e) => setFilters({ ...filters, branch_id: e.target.value })}
          >
            <option value="">All Branches</option>
            {(branches || []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.branch_name}
              </option>
            ))}
          </select>
        </div>

        {showMonth && (
          <div>
            <label>Month</label>
            <select
              value={filters.month || ""}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            >
              <option value="">All Months</option>
              <option value="1">Jan</option>
              <option value="2">Feb</option>
              <option value="3">Mar</option>
              <option value="4">Apr</option>
              <option value="5">May</option>
              <option value="6">Jun</option>
              <option value="7">Jul</option>
              <option value="8">Aug</option>
              <option value="9">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
          </div>
        )}

        {showWeek && (
          <div>
            <label>Week</label>
            <input
              value={filters.week || ""}
              onChange={(e) => setFilters({ ...filters, week: e.target.value })}
              placeholder="Week-1"
            />
          </div>
        )}

        {showUser && (
          <div>
            <label>Assigned User</label>
            <select
              value={filters.assigned_to || ""}
              onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
            >
              <option value="">All Users</option>
              {(users || []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        )}

        {showName && (
          <div>
            <label>Customer Name</label>
            <input
              value={filters.customer_name || ""}
              onChange={(e) => setFilters({ ...filters, customer_name: e.target.value })}
              placeholder="Search customer"
            />
          </div>
        )}
      </div>

      <div className="filter-actions">
        <button className="btn btn-primary" onClick={onApply}>
          <FaSearch /> Apply
        </button>
        <button className="btn btn-secondary" onClick={onReset}>
          <FaUndo /> Reset
        </button>
        {onExport && (
          <button className="btn btn-success" onClick={onExport}>
            <FaFileExcel /> Export
          </button>
        )}
      </div>
    </div>
  );
}