const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    roles: {
      type: [
        {
          type: Number,
          enum: [2000, 1995, 5919],
        },
      ],
      default: [2000],
    },
    customerIsBanned: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: String,
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
