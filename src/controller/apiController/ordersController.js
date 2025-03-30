const mongoose = require("mongoose");
const Order = require("../../model/apiModel/Order");
const OrderItem = require("../../model/apiModel/OrderItem");
const Address = require("../../model/Address");
const { findOrderById, deleteOrder } = require("../../services/orderUtils");
const {
  findOrderItemById,
  findAndPopulateOrderItemProductPrice,
  creatOrderItem,
} = require("../../services/orderItemUtils");
const {
  findAddressById,
  createAddress,
} = require("../../services/addressUtils");
const { validMongooseId, responseMessage } = require("../../services/utils");

const getAllOrders = async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "username")
    .sort({ createdAt: -1 });
  if (!orderList) {
    return res.status(204).json({ message: "No Orders Found." });
  }
  res.json(orderList);
};

const createNewOrder = async (req, res) => {
  const { orderItems, shippingAddress1, shippingAddress2, phone, user } =
    req.body;

  // Validate required fields
  if (!orderItems?.length || !shippingAddress1 || !phone) {
    return responseMessage(res, 400, false, "Required fields are missing");
  }

  try {
    // Create OrderItems and calculate total price in one go
    const orderItemIds = [];
    let totalPrice = 0;

    for (const item of orderItems) {
      const newOrderItem = await creatOrderItem({ body: { ...item } });

      const populatedItem = await findAndPopulateOrderItemProductPrice(
        newOrderItem._id
      ); // Use lean() for performance since we only need data

      totalPrice += populatedItem.product.price * item.quantity;
      orderItemIds.push(newOrderItem._id);
    }

    // Handle shipping addresses
    const addressDoc1 = await createAddress({ body: { ...shippingAddress1 } });
    const addressDoc2 = shippingAddress2
      ? await createAddress({ body: { ...shippingAddress2 } })
      : null;

    // Create the order
    const order = await Order.create({
      orderItems: orderItemIds,
      shippingAddress1: addressDoc1._id,
      shippingAddress2: addressDoc2?._id || null,
      phone,
      totalPrice,
      user,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    responseMessage(res, 500, false, "Error creating order", error);
  }
};

const getOrder = async (req, res) => {
  if (!req?.params?.id)
    return responseMessage(res, 400, false, "Order ID is required.");

  if (!validMongooseId(req.params.id))
    return responseMessage(
      res,
      400,
      false,
      `No Order ID matches ${req.params.id}.`
    );

  try {
    const order = await Order.findOne({ _id: req.params.id })
      .populate([
        {
          path: "user",
          select: "username",
        },
        {
          path: "orderItems",
          populate: {
            path: "product",
            select: "name",
            populate: { path: "category", select: "name" },
          },
        },
        {
          path: "shippingAddress1",
          select: "street city country",
        },
        {
          path: "shippingAddress2",
          select: "street city country",
        },
      ])
      .exec();

    res.json(order);
  } catch (error) {
    console.error(error);
    return responseMessage(
      res,
      500,
      false,
      `Error fetching order: ${error.message}`
    );
  }
};

const updateOrderStatus = async (req, res) => {
  if (!req?.body?.id) {
    return responseMessage(res, 400, false, "ID parameter is required");
  }

  if (!validMongooseId(req.body.id))
    return responseMessage(
      res,
      400,
      false,
      `The ID: ${req.body.id} provided is not a valid ID.`
    );

  const order = await Order.findOne({ _id: req.body.id }).exec();
  if (!order) {
    return responseMessage(
      res,
      400,
      false,
      `No order matches the ID ${req.body.id}.`
    );
  }

  if (req?.body?.status) order.status = req.body.status;

  const result = await order.save();
  res.json(result);
};

const deleteOrder = async (req, res) => {
  // check if an order ID is being provided
  const orderId = req.params.id || req.body.id;
  if (!orderId) {
    return responseMessage(res, 400, false, "Order ID is required");
  }

  if (!validMongooseId(orderId))
    return responseMessage(res, 400, false, "enter a valid order ID");

  try {
    //  check if order exists
    const order = await findOrderById(orderId);
    if (!order) {
      return responseMessage(
        res,
        404,
        false,
        `No order found with ID: ${orderId}`
      );
    }

    // delete orderItems
    if (order.orderItems.length > 0) {
      await OrderItem.deleteMany({
        _id: { $in: order.orderItems },
      });
    }

    // Delete the order
    await deleteOrder(orderId);
    return responseMessage(
      res,
      200,
      true,
      `Order ${orderId} deleted successfully`
    );
  } catch (error) {
    console.error("Delete order error:", error);
    return responseMessage(res, 500, false, `Server error: ${error.message}`);
  }
};

const getTotalSales = async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.Status(400).send("The order sales cannot be generated");
  }
  const result = totalSales.pop().totalSales;
  res.send({ totalSales: result });
};

const getOrdersCount = async (req, res) => {
  try {
    const count = await Order.countDocuments();
    if (count === 0) {
      return res.status(404).json({ error: "No orders found" });
    }
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserOrders = async (req, res) => {
  // const order = await Order.findOne({ _id: req.params.id })

  const userOrders = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .sort({ dateOrdered: -1 })
    .exec();
  if (!userOrders) {
    return res.status(204).json({ message: "No Orders Found." });
  }
  res.json(userOrders);
};

module.exports = {
  getAllOrders,
  createNewOrder,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  getTotalSales,
  getOrdersCount,
  getUserOrders,
};

// 29 : 10
