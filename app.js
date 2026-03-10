const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const techRefRoutes = require("./modules/techRef/techRef.routes");
const l2Routes = require("./modules/l2/l2.routes");
const newConnRoutes = require("./modules/newConn/newConn.routes");
const reactRoutes = require("./modules/react/react.routes");
const upsellRoutes = require("./modules/upsell/upsell.routes");
const tasksRoutes = require("./modules/tasks/tasks.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const masterRoutes = require("./modules/master/master.routes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ ok: true, service: "crm-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tech-ref-leads", techRefRoutes);
app.use("/api/l2", l2Routes);
app.use("/api/new-conn", newConnRoutes);
app.use("/api/react", reactRoutes);
app.use("/api/upsell", upsellRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/master", masterRoutes);

app.use(errorHandler);

module.exports = app;