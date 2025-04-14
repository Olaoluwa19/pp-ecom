const OrderItem = require("../model/apiModel/OrderItem");

const findOrderItemById = async (id) => {
  return await OrderItem.findById(id);
};

const findAndPopulateOrderItemProductPrice = async (id) => {
  return await OrderItem.findById(id).populate("product", "price").lean(); // Use lean() for performance since we only need data
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
