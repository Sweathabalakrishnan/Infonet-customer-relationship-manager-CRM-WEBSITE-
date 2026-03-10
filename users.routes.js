const router = require("express").Router();
const auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");
const c = require("./users.controller");

router.use(auth);

router.get("/", authorize("ADMIN"), c.list);
router.post("/", authorize("ADMIN"), c.create);
router.put("/:id", authorize("ADMIN"), c.update);
router.put("/:id/status", authorize("ADMIN"), c.toggleStatus);

module.exports = router;