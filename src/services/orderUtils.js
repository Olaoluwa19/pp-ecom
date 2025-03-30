const Order = require("../model/apiModel/Order");

const findOrderById = async (id) => {
  return await Order.findOne({ _id: id }).exec();
};

const deleteOrder = async (id) => {
  return await Order.deleteOne({ _id: id });
};

module.exports = {
  findOrderById,
  deleteOrder,
};
