const express = require("express");
const router = express.Router();
const passport = require("passport");
const { handleLogin } = require("../controller/authController");
const path = require("path");

router.post("/", handleLogin);

router.get("/google", (req, res, next) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:8000",
    failureRedirect: "http://localhost:8000/404",
  })
);

module.exports = router;
