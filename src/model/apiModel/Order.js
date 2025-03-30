const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema(
  {
    orderItems: [
      {
        type: Schema.ObjectId,
        ref: "OrderItem",
        required: true,
      },
    ],
    shippingAddress1: {
      type: Schema.ObjectId,
      ref: "Address",
      required: true,
    },
    shippingAddress2: {
      type: Schema.ObjectId,
      ref: "Address",
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Pending",
    },
    totalPrice: {
      type: Number,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
