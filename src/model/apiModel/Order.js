const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
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
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    totalPrice: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
