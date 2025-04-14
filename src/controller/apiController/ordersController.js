const mongoose = require("mongoose");
const Order = require("../../model/apiModel/Order");
const OrderItem = require("../../model/apiModel/OrderItem");
const { findUserById } = require("../../services/userUtils");
const { findOrderById, deleteOrderById } = require("../../services/orderUtils");
const {
  findOrderItemById,
  findAndPopulateOrderItemProductPrice,
  creatOrderItem,
} = require("../../services/orderItemUtils");
const {
  findAddressById,
  createAddress,
} = require("../../services/addressUtils");
const {
  validMongooseId,
  responseMessage,
  serverErrorMessage,
} = require("../../services/utils");

const getAllOrders = async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "username")
    .sort({ createdAt: -1 });
  if (!orderList) {
    return responseMessage(res, 204, false, "No Orders Found.");
  }
  res.json(orderList);
};

const createNewOrder = async (req, res) => {
  const { orderItems, shippingAddress1, shippingAddress2, phone, user } =
    req.body;

  if (!user)
    return responseMessage(
      res,
      400,
      false,
      "You need a valid user id to create an order"
    );

  if (!validMongooseId(user))
    return responseMessage(res, 400, false, `Invalid ID:${user} provided`);

  // Check if user exists
  const validUser = await findUserById(user);

  if (!validUser)
    return responseMessage(
      res,
      400,
      false,
      `No user found with the id: ${user}`
    );

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
      );

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

    const populatedOrder = await Order.findOne(order._id)
      .populate([
        {
          path: "user",
          select: "username email phone",
        },
        {
          path: "orderItems",
          populate: {
            path: "product",
            select: "-createdAt -updatedAt -__v",
            populate: {
              path: "category",
              select: "-createdAt -updatedAt -__v",
            },
          },
        },
        {
          path: "shippingAddress1",
          select: "-createdAt -updatedAt -__v",
        },
        {
          path: "shippingAddress2",
          select: "-createdAt -updatedAt -__v",
        },
      ])
      .exec();

    res.status(201).json(populatedOrder);
  } catch (error) {
    return serverErrorMessage(res, error);
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
      `Invalid Order ID: ${req.params.id}.`
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

    return order
      ? res.json(order)
      : responseMessage(
          res,
          400,
          false,
          `No Order with id: ${req.params.id} Found.`
        );
  } catch (error) {
    return serverErrorMessage(res, error);
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

  // validate order status
  if (
    !["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].includes(
      req.body.status
    )
  ) {
    return responseMessage(res, 400, false, "Invalid order status input");
  }

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
  const orderId = req.body.id;
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
    await deleteOrderById(orderId);
    return responseMessage(
      res,
      200,
      true,
      `Order ${orderId} deleted successfully`
    );
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

const getSalesByStatus = async (req, res) => {
  // extract status from request body
  const { status } = req.body;

  // validate status
  const validStatuses = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  // If no status provided, aggregate all orders
  let query = {};
  if (status) {
    // Validate status if provided
    if (!validStatuses.includes(status)) {
      return responseMessage(
        res,
        400,
        false,
        "Invalid or missing status. Must be one of: " + validStatuses.join(", ")
      );
    }
    query = { status }; // filter by status if valid
  }

  try {
    // Perform aggregation to sum totalPrice
    const salesByStatus = await Order.aggregate([
      // Filter for orders with the specified status (if provided)
      {
        $match: query, // Empty object matches all documents when no status is given
      },
      // Group and sum the totalPrice
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);

    // Check if there are any results
    if (salesByStatus.length === 0) {
      return responseMessage(
        res,
        200,
        true,
        status
          ? `No ${status} orders found { totalSales: 0 }`
          : "No orders found { totalSales: 0 }"
      );
    }

    // Extract totalSales value from the aggregation result
    const result = salesByStatus[0].totalSales;
    return responseMessage(
      res,
      200,
      true,
      status
        ? res.json({ status: status, "total sales": result })
        : res.json({ totalSales: result })
    );
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

const getOrdersCountByStatus = async (req, res) => {
  try {
    // extract status from request body
    const { status } = req.body;

    // validate order statuse
    const validStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    // If no status provided, count all orders
    let query = {};
    if (status) {
      // Validate status if provided
      if (!validStatuses.includes(status)) {
        return responseMessage(
          res,
          400,
          false,
          "Invalid status. Must be one of: " + validStatuses.join(", ")
        );
      }
      query = { status }; // Filter by status if valid
    }

    // Count documents based on query
    const count = await Order.countDocuments(query);

    // Return appropriate response
    if (count === 0) {
      const message = status ? `No ${status} orders found` : "No orders found";
      return responseMessage(res, 200, true, `${message}: {count: ${count} }`);
    }

    const message = status
      ? `Found ${count} ${status} orders`
      : `Found ${count} total orders`;

    return res.json({ message: message, count: count });
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

const getUserOrders = async (req, res) => {
  const userOrders = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .sort({ createdAt: -1 })
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
  getSalesByStatus,
  getOrdersCountByStatus,
  getUserOrders,
};
