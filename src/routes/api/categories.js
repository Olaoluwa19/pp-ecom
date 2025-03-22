const express = require("express");
const router = express.Router();
const categoriesController = require("../../controller/apiController/categoriesController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(categoriesController.getAllCategories)
  .post(verifyRoles(ROLES_LIST.Editor), categoriesController.createNewCategory)
  .put(verifyRoles(ROLES_LIST.Editor), categoriesController.updateCategory)
  .delete(verifyRoles(ROLES_LIST.Editor), categoriesController.deleteCategory);

router.route("/:id").get(categoriesController.getCategory);

module.exports = router;
