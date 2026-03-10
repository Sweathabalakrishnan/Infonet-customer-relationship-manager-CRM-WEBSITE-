const pool = require("../../config/db");
const bcrypt = require("bcryptjs");
const env = require("../../config/env");
const asyncHandler = require("../../utils/asyncHandler");

async function validateZoneBranch(zone_id, branch_id) {
  if (!zone_id && !branch_id) {
    return { zone_id: null, branch_id: null };
  }

  if (zone_id) {
    const [zones] = await pool.query(`SELECT id FROM zones WHERE id=?`, [zone_id]);
    if (!zones.length) throw new Error("Selected zone does not exist");
  }

  if (branch_id) {
    const [branches] = await pool.query(`SELECT id, zone_id FROM branches WHERE id=?`, [branch_id]);
    if (!branches.length) throw new Error("Selected branch does not exist");

    if (zone_id && Number(branches[0].zone_id) !== Number(zone_id)) {
      throw new Error("Selected branch does not belong to selected zone");
    }
  }

  return {
    zone_id: zone_id || null,
    branch_id: branch_id || null
  };
}

exports.list = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id,name,username,role,zone_id,branch_id,mobile,email,is_active,created_at
     FROM users
     ORDER BY id DESC`
  );
  res.json({ data: rows });
});

exports.create = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const required = ["name", "username", "password", "role"];
  for (const k of required) {
    if (!b[k]) return res.status(400).json({ message: `${k} required` });
  }

  const validated = await validateZoneBranch(b.zone_id, b.branch_id);

  const password_hash = await bcrypt.hash(b.password, env.BCRYPT_ROUNDS);

  const [r] = await pool.query(
    `INSERT INTO users
      (name, username, password_hash, role, zone_id, branch_id, mobile, email, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      b.name,
      b.username,
      password_hash,
      b.role,
      validated.zone_id,
      validated.branch_id,
      b.mobile || null,
      b.email || null
    ]
  );

  res.json({ id: r.insertId, message: "User created" });
});

exports.update = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const b = req.body || {};

  const validated = await validateZoneBranch(b.zone_id, b.branch_id);

  await pool.query(
    `UPDATE users
     SET name=?, role=?, zone_id=?, branch_id=?, mobile=?, email=?
     WHERE id=?`,
    [
      b.name || null,
      b.role || "SALES",
      validated.zone_id,
      validated.branch_id,
      b.mobile || null,
      b.email || null,
      id
    ]
  );

  res.json({ message: "User updated" });
});

exports.toggleStatus = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { is_active } = req.body || {};

  if (typeof is_active === "undefined") {
    return res.status(400).json({ message: "is_active required" });
  }

  await pool.query(`UPDATE users SET is_active=? WHERE id=?`, [is_active ? 1 : 0, id]);
  res.json({ message: "Status updated" });
});