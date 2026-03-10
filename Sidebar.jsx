import { NavLink } from "react-router-dom";
import {
  FaChartLine,
  FaUsers,
  FaBroadcastTower,
  FaProjectDiagram,
  FaPlug,
  FaSyncAlt,
  FaArrowUp,
  FaTasks
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const menu = [
    { label: "Dashboard", path: "/dashboard", icon: <FaChartLine />, roles: ["ADMIN", "ZONE_MANAGER", "BRANCH_MANAGER", "SALES", "TECH"] },
    { label: "Tech Ref Leads", path: "/tech-ref-leads", icon: <FaBroadcastTower />, roles: ["ADMIN", "ZONE_MANAGER", "BRANCH_MANAGER", "TECH", "SALES"] },
    { label: "L2 Feasibility", path: "/l2", icon: <FaProjectDiagram />, roles: ["ADMIN", "ZONE_MANAGER", "BRANCH_MANAGER", "TECH"] },
    { label: "New Connection", path: "/new-conn", icon: <FaPlug />, roles: ["ADMIN", "ZONE_MANAGER", "BRANCH_MANAGER", "SALES"] },
    { label: "Reactivation", path: "/reactivation", icon: <FaSyncAlt />, roles: ["ADMIN", "ZONE_MANAGER", "BRANCH_MANAGER", "SALES"] },
    { label: "Upsell", path: "/upsell", icon: <FaArrowUp />, roles: ["ADMIN", "ZONE_MANAGER", "BRANCH_MANAGER", "SALES"] },
    { label: "Tasks", path: "/tasks", icon: <FaTasks />, roles: ["ADMIN", "ZONE_MANAGER", "BRANCH_MANAGER", "SALES", "TECH"] },
    { label: "Users", path: "/users", icon: <FaUsers />, roles: ["ADMIN"] }
  ];

  return (
    <aside className="sidebar">
      <div className="brand">Infonet CRM</div>

      <nav className="sidebar-nav">
        {menu
          .filter((item) => item.roles.includes(role))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <span style={{ marginRight: 10 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}