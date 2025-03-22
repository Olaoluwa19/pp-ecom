const mongoose = require("mongoose");
const Order = require("../../model/apiModel/Order");
const OrderItem = require("../../model/apiModel/OrderItem");

const getAllOrders = async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "username")
    .sort({ dateOrdered: -1 });
  if (!orderList) {
    return res.status(204).json({ message: "No Orders Found." });
  }
  res.json(orderList);
};

const createNewOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress1, city, zip, country, phone } =
      req.body;
    if (
      !orderItems ||
      !shippingAddress1 ||
      !city ||
      !zip ||
      !country ||
      !phone
    ) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const orderItemsWithTotalPrice = await Promise.all(
      orderItems.map(async (orderItem) => {
        const newOrderItem = await OrderItem.create({
          quantity: orderItem.quantity,
          product: orderItem.product,
        });
        const productPrice = await OrderItem.findById(
          newOrderItem._id
        ).populate("product", "price");
        return {
          id: newOrderItem._id,
          totalPrice: productPrice.product.price * orderItem.quantity,
        };
      })
    );

    const totalPrice = orderItemsWithTotalPrice.reduce(
      (acc, cur) => acc + cur.totalPrice,
      0
    );

    const order = await Order.create({
      orderItems: orderItemsWithTotalPrice.map((item) => item.id),
      shippingAddress1,
      city,
      zip,
      country,
      phone,
      totalPrice,
      user: req.body.user,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating order" });
  }
};

const getOrder = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Order ID is required." });

  if (!mongoose.isValidObjectId(req.params.id))
    return res
      .status(400)
      .json({ message: `No Order ID matches ${req.params.id}.` });

  const order = await Order.findOne({ _id: req.params.id })
    .populate("user", "username")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .exec();

  res.json(order);
};

const updateOrder = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID parameter is required" });
  }

  if (!mongoose.isValidObjectId(req.body.id))
    return res
      .status(400)
      .json({ message: `No order ID matches ${req.body.id}.` });

  const order = await Order.findOne({ _id: req.body.id }).exec();
  if (!order) {
    return res
      .status(400)
      .json({ message: `No order matches the ID ${req.body.id}.` });
  }

  if (req?.body?.status) order.status = req.body.status;

  const result = await order.save();
  res.json(result);
};

const deleteOrder = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "Order ID required." });

  try {
    const order = await Order.findOne({ _id: req.body.id });
    if (order) {
      await OrderItem.deleteMany({ order: order._id }).exec();

      const result = await order.deleteOne({ _id: req.body.id });
      res.json(result);
    } else {
      return res
        .status(204)
        .json({ message: `No order ID matches ${req.body.id}.` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting Order" });
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
  updateOrder,
  deleteOrder,
  getTotalSales,
  getOrdersCount,
  getUserOrders,
};

// 29 : 10
