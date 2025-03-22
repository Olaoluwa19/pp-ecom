const express = require("express");
const router = express.Router();
const ordersController = require("../../controller/apiController/ordersController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(
    verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
    ordersController.getAllOrders
  )
  .post(verifyRoles(ROLES_LIST.User), ordersController.createNewOrder)
  .put(verifyRoles(ROLES_LIST.Admin), ordersController.updateOrder)
  .delete(verifyRoles(ROLES_LIST.User), ordersController.deleteOrder);

router
  .route("/count")
  .get(
    verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
    ordersController.getOrdersCount
  );
router
  .route("/totalSales")
  .get(
    verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
    ordersController.getTotalSales
  );
router
  .route("/userOrders/:userid")
  .get(verifyRoles(ROLES_LIST.User), ordersController.getUserOrders);
router.route("/:id").get(ordersController.getOrder);

module.exports = router;
