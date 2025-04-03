const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  createNewOrder,
  updateOrderStatus,
  deleteOrder,
  getOrdersCountByStatus,
  getSalesByStatus,
  getUserOrders,
  getOrder,
} = require("../../controller/APIController/ordersController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(verifyRoles(ROLES_LIST.Admin), getAllOrders)
  .post(verifyRoles(ROLES_LIST.User), createNewOrder)
  .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Seller), updateOrderStatus)
  .delete(verifyRoles(ROLES_LIST.User), deleteOrder);

router
  .route("/count-by-status")
  .post(verifyRoles(ROLES_LIST.Admin), getOrdersCountByStatus);
router
  .route("/sales-by-status")
  .post(verifyRoles(ROLES_LIST.Admin), getSalesByStatus);
router.route("/user-orders/:userid").get(getUserOrders);
router.route("/:id").get(getOrder);

module.exports = router;
