const express = require("express");
const router = express.Router();

router.use(protectionMiddleware);
router.get("/api/users/userId", (req, res, next) => {
  res.json(req.user);
});

module.exports = router;
