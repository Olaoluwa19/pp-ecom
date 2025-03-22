const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema(
  {
    street: {
      type: String,
      default: "",
    },
    apartment: {
      type: Number,
      default: "",
    },
    zip: {
      type: Number,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
