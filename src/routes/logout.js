const express = require("express");
const router = express.Router();
const {
  handleLogout,
  handleGoogleLogout,
} = require("../controller/logoutController");

router.get("/", handleLogout);

router.get("/google", handleGoogleLogout);

module.exports = router;
