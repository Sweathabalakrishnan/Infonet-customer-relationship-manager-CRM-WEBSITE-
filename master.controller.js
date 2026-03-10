const pool = require("../../config/db");
const asyncHandler = require("../../utils/asyncHandler");

exports.zones = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, zone_name FROM zones ORDER BY zone_name ASC`
  );
  res.json({ data: rows });
});

exports.branches = asyncHandler(async (req, res) => {
  const { zone_id } = req.query;

  let sql = `SELECT id, zone_id, branch_name FROM branches`;
  const params = [];

  if (zone_id) {
    sql += ` WHERE zone_id = ?`;
    params.push(zone_id);
  }

  sql += ` ORDER BY branch_name ASC`;

  const [rows] = await pool.query(sql, params);
  res.json({ data: rows });
});

exports.plans = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, plan_name, plan_amount, speed FROM plans ORDER BY plan_name ASC`
  );
  res.json({ data: rows });
});

exports.usersLite = asyncHandler(async (req, res) => {
  const { role } = req.query;

  let sql = `SELECT id, name, username, role, zone_id, branch_id FROM users WHERE is_active = 1`;
  const params = [];

  if (role) {
    sql += ` AND role = ?`;
    params.push(role);
  }

  sql += ` ORDER BY name ASC`;

  const [rows] = await pool.query(sql, params);
  res.json({ data: rows });
});