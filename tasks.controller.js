const pool = require("../../config/db");
const asyncHandler = require("../../utils/asyncHandler");

function normalizeMySQLDateTime(value) {
  if (!value) return null;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  const pad = (n) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

exports.list = asyncHandler(async (req, res) => {
  const u = req.user;
  const { assigned_to, status, module_name, from_date, to_date } = req.query;

  let sql = `SELECT * FROM tasks WHERE 1=1`;
  const params = [];

  if (u.role !== "ADMIN") {
    sql += ` AND assigned_to = ?`;
    params.push(u.id);
  }

  if (assigned_to) {
    sql += ` AND assigned_to = ?`;
    params.push(assigned_to);
  }

  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }

  if (module_name) {
    sql += ` AND module_name = ?`;
    params.push(module_name);
  }

  if (from_date) {
    sql += ` AND DATE(followup_date) >= ?`;
    params.push(from_date);
  }

  if (to_date) {
    sql += ` AND DATE(followup_date) <= ?`;
    params.push(to_date);
  }

  sql += ` ORDER BY id DESC LIMIT 300`;

  const [rows] = await pool.query(sql, params);
  res.json({ data: rows });
});

exports.create = asyncHandler(async (req, res) => {
  const b = req.body || {};

  if (!b.module_name || !b.record_id || !b.assigned_to || !b.followup_date) {
    return res.status(400).json({ message: "module_name, record_id, assigned_to, followup_date required" });
  }

  const [r] = await pool.query(
    `INSERT INTO tasks
      (module_name, record_id, assigned_to, followup_date, note, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      b.module_name,
      b.record_id,
      b.assigned_to,
      normalizeMySQLDateTime(b.followup_date),
      b.note || null,
      b.status || "OPEN"
    ]
  );

  res.json({ id: r.insertId, message: "Created" });
});

exports.update = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const b = req.body || {};

  await pool.query(
    `UPDATE tasks
     SET assigned_to=?, followup_date=?, note=?, status=?
     WHERE id=?`,
    [
      b.assigned_to || null,
      normalizeMySQLDateTime(b.followup_date),
      b.note || null,
      b.status || "OPEN",
      id
    ]
  );

  res.json({ message: "Updated" });
});