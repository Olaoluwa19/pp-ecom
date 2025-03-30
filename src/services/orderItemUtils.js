const OrderItem = require("../model/apiModel/OrderItem");

const findOrderItemById = async (id) => {
  return await OrderItem.findById(id);
};

const findAndPopulateOrderItemProductPrice = async (id) => {
  return await OrderItem.findById(newOrderItem._id)
    .populate("product", "price")
    .lean();
};

const creatOrderItem = async (req) => {
  return await OrderItem.create({
    quantity: req.body.quantity,
    product: req.body.product,
  });
};

module.exports = {
  findOrderItemById,
  findAndPopulateOrderItemProductPrice,
  creatOrderItem,
};
