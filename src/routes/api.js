const express = require("express");
const api = express.Router();
const verifyJWT = require("../middleware/verifyJWT");

//  ROUTES
api.use("/", require("./routes/root"));
api.use("/register", require("./routes/register"));
api.use("/auth", require("./routes/auth"));
api.use("/refresh", require("./routes/refresh"));
api.use("/logout", require("./routes/logout"));

api.use(verifyJWT);
api.use("/products", require("./routes/api/products"));
api.use("/categories", require("./routes/api/categories"));
api.use("/orders", require("./routes/api/orders"));
api.use("/users", require("./routes/api/users"));

module.exports = api;
