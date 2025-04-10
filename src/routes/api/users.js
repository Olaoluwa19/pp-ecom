const express = require("express");
const router = express.Router();
const {
  getAllUser,
  updateUser,
  deleteUser,
  countUserRoles,
  suspendUser,
  getUser,
} = require("../../controller/APIController/usersController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(verifyRoles(ROLES_LIST.Admin), getAllUser)
  .put(updateUser)
  .delete(verifyRoles(ROLES_LIST.Admin), deleteUser);

router.route("/suspend").put(verifyRoles(ROLES_LIST.Admin), suspendUser);

router.route("/role/:role").get(verifyRoles(ROLES_LIST.Admin), countUserRoles);

router.route("/:id").get(getUser);

module.exports = router;
