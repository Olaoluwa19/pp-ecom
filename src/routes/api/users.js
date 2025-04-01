const express = require("express");
const router = express.Router();
const usersController = require("../../controller/APIController/usersController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(verifyRoles(ROLES_LIST.Admin), usersController.getAllUser)
  .put(usersController.updateUser)
  .delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteUser);

router
  .route("/role/:role?")
  .get(verifyRoles(ROLES_LIST.Admin), usersController.filterUsers);
router.route("/:id").get(usersController.getUser);

module.exports = router;
