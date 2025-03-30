const Order = require("../model/apiModel/Order");

const findOrderById = async (id) => {
  return await Order.findOne({ _id: id }).exec();
};

const deleteOrderById = async (id) => {
  return await Order.deleteOne({ _id: id });
};

module.exports = {
  findOrderById,
  deleteOrderById,
};
