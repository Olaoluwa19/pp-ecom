const express = require("express");
const router = express.Router();
const uploadOptions = require("../../middleware/productImageHandler");
const productsController = require("../../controller/apiController/productsController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(verifyRoles(ROLES_LIST.Editor), productsController.getAllProduct)
  .post(
    verifyRoles(ROLES_LIST.Admin),
    uploadOptions.single("image"),
    productsController.createNewProduct
  )
  .put(
    verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
    uploadOptions.single("image"),
    productsController.updateProduct
  )
  .delete(
    verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
    productsController.deleteProduct
  );

router
  .route("/count")
  .get(
    verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
    productsController.getProductCount
  );
router
  .route("/featured/:count?")
  .get(
    verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
    productsController.getFeaturedProduct
  );
router
  .route("/category/:category?")
  .get(
    verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
    productsController.getProductCategory
  );
router
  .route("/userproducts/:userid?")
  .get(
    verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
    productsController.getUserProducts
  );
// router
//   .route("/update/:userid?")
//   .put(
//     verifyRoles(ROLES_LIST.Admin),
//     uploadOptions.single("image"),
//     productsController.updateProduct
//   );
router
  .route("/gallery-images/:id?")
  .put(
    verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
    uploadOptions.array("images", 10),
    productsController.handleGalleryImages
  );
router
  .route("/:id")
  .get(
    verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
    productsController.getProduct
  );

module.exports = router;
