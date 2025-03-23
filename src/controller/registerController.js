const mongoose = require("mongoose");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const Address = require("../model/Address");
const { validatePassword, responseMessage } = require("../service/utils");

const createNewUser = async (req, res) => {
  const { username, email, phone, password, address, roles } = req.body;

  // validate user roles
  if (![2000, 1995, 5919].includes(roles)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid role selected" });
  }

  //check for missing fields
  if (!username || !email || !phone || !password || !roles) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  // check if password length greater than 6
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  // check if password matches regex
  validatePassword(password, res);
  // const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
  // if (!regex.test(password)) {
  //   return res.status(400).json({
  //     success: false,
  //     message:
  //       "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  //   });
  // }

  const duplicate = await User.findOne({
    username: username,
    roles: roles,
  }).exec();

  if (duplicate) {
    responseMessage(res, 409, false, "User already exists. Please login.");
    // return res
    //   .status(409)
    //   .json({ success: false, message: "User already exists. Please login." }); // conflict
  }

  try {
    // create address document
    const { street, apartment, zip, city, country } = address;

    const addressDoc = await Address.create({
      street,
      apartment,
      zip,
      city,
      country,
    });

    // encrypt the password
    const hashedPwd = await bcrypt.hash(req.body.password, 10);
    const newUser = await User.create({
      username,
      roles,
      password: hashedPwd,
      email,
      phone,
      address: addressDoc._id,
    });

    const populatedUser = await User.findOne({ _id: newUser._id })
      .select("-password")
      .populate({
        path: "address",
        select: "-_id -createdAt -updatedAt -zip -apartment",
      })
      .exec();

    console.log(populatedUser);
    return res.status(201).json(populatedUser);
  } catch (error) {
    // throw new Error(`Error creating user: ${error.message}`);
    console.log(error);
    return res.status(400).json({
      message: `Error creating user: ${error.message}`,
    });
  }
};

module.exports = { createNewUser };
