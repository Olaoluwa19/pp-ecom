const express = require("express");
const router = express.Router();
const { uploadOptions } = require("../../middleware/imageHandler");
const {
  getAllProduct,
  createNewProduct,
  updateProduct,
  deleteProduct,
  getProductCount,
  getFeaturedProduct,
  getProductCategory,
  getProduct,
  updateGalleryImages,
  getUserProducts,
  countUserProduct,
} = require("../../controller/APIController/productsController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(verifyRoles(ROLES_LIST.Admin), getAllProduct)
  .post(
    verifyRoles(ROLES_LIST.Seller),
    uploadOptions.single("image"),
    createNewProduct
  )
  .put(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Seller),
    uploadOptions.array("images", 10),
    updateProduct
  )
  .delete(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Seller), deleteProduct);

router
  .route("/count")
  .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Seller), getProductCount);

router
  .route("/count/:userid")
  .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Seller), countUserProduct);

router
  .route("/featured/:count")
  .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Seller), getFeaturedProduct);

router
  .route("/category/:category")
  .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Seller), getProductCategory);

router
  .route("/gallery-images/:id")
  .put(
    verifyRoles(ROLES_LIST.Seller),
    uploadOptions.array("images", 10),
    updateGalleryImages
  );

router
  .route("/userproducts/:userid")
  .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Seller), getUserProducts);

router
  .route("/:id")
  .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Seller), getProduct);

module.exports = router;
