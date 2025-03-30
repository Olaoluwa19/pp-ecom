const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  createNewOrder,
  updateOrderStatus,
  deleteOrder,
  getOrdersCount,
  getTotalSales,
  getUserOrders,
  getOrder,
} = require("../../controller/APIController/ordersController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin), getAllOrders)
  .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.User), createNewOrder)
  .put(verifyRoles(ROLES_LIST.Admin), updateOrderStatus)
  .delete(verifyRoles(ROLES_LIST.User), deleteOrder);

router
  .route("/count")
  .get(verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin), getOrdersCount);
router
  .route("/totalSales")
  .get(verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin), getTotalSales);
router
  .route("/userOrders/:userid")
  .get(verifyRoles(ROLES_LIST.User), getUserOrders);
router.route("/:id").get(getOrder);

module.exports = router;
