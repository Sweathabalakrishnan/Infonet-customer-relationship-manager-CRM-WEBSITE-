function buildScopeWhere(user, alias = "") {
  const p = alias ? `${alias}.` : "";

  if (user.role === "ADMIN") return { where: "1=1", params: [] };

  if (user.role === "ZONE_MANAGER") {
    return { where: `${p}zone_id = ?`, params: [user.zone_id] };
  }

  if (user.role === "BRANCH_MANAGER") {
    return { where: `${p}branch_id = ?`, params: [user.branch_id] };
  }

  // SALES / TECH
  return { where: `(${p}created_by = ? OR ${p}assigned_to = ?)`, params: [user.id, user.id] };
}

module.exports = { buildScopeWhere };