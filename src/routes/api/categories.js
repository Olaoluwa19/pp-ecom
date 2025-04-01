const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  createNewCategory,
  updateCategory,
  deleteCategory,
  getCategory,
} = require("../../controller/APIController/categoriesController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(getAllCategories)
  .post(verifyRoles(ROLES_LIST.Admin), createNewCategory)
  .put(verifyRoles(ROLES_LIST.Admin), updateCategory)
  .delete(verifyRoles(ROLES_LIST.Admin), deleteCategory);

router.route("/:id").get(getCategory);

module.exports = router;
