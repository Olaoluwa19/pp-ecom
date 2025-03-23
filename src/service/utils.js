// utils.js
const validatePassword = (password) => {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
  return regex.test(password);
};

const responseMessage = (res, resStat, sucStat, resMsg) => {
  res.status(resStat).json({
    success: sucStat,
    message: resMsg,
  });
};

const createAddress = async (addressData) => {
  const { street, apartment, zip, city, country } = addressData;
  return await Address.create({
    street,
    apartment,
    zip,
    city,
    country,
  });
};

const createUser = async (userData, addressId) => {
  const { username, roles, password, email, phone } = userData;
  return await User.create({
    username,
    roles,
    password,
    email,
    phone,
    address: addressId,
  });
};

const getPopulatedUser = async (userId) => {
  return await User.findOne({ _id: userId })
    .select("-password")
    .populate({
      path: "address",
      select: "-_id -createdAt -updatedAt -zip -apartment",
    })
    .exec();
};

module.exports = {
  validatePassword,
  responseMessage,
  createAddress,
  createUser,
  getPopulatedUser,
};

// registerController.js
const mongoose = require("mongoose");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const {
  validatePassword,
  responseMessage,
  createAddress,
  createUser,
  getPopulatedUser,
} = require("./utils");

const createNewUser = async (req, res) => {
  const { username, email, phone, password, address, roles } = req.body;

  // Validate user roles
  if (![2000, 1995, 5919].includes(roles)) {
    return responseMessage(res, 400, false, "Invalid role selected");
  }

  // Check for missing fields
  if (!username || !email || !phone || !password || !roles) {
    return responseMessage(res, 400, false, "Missing required fields");
  }

  // Check password length
  if (password.length < 6) {
    return responseMessage(
      res,
      400,
      false,
      "Password must be at least 6 characters"
    );
  }

  // Check password complexity
  if (!validatePassword(password)) {
    return responseMessage(
      res,
      400,
      false,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    );
  }

  // Check for duplicate user
  const duplicate = await User.findOne({
    username: username,
    roles: roles,
  }).exec();

  if (duplicate) {
    return responseMessage(
      res,
      409,
      false,
      "User already exists. Please login."
    );
  }

  try {
    // Create address
    const addressDoc = await createAddress(address);

    // Encrypt password
    const hashedPwd = await bcrypt.hash(password, 10);

    // Create user
    const userData = { username, roles, password: hashedPwd, email, phone };
    const newUser = await createUser(userData, addressDoc._id);

    // Get populated user
    const populatedUser = await getPopulatedUser(newUser._id);

    console.log(populatedUser);
    return res.status(201).json(populatedUser);
  } catch (error) {
    console.log(error);
    return responseMessage(
      res,
      400,
      false,
      `Error creating user: ${error.message}`
    );
  }
};

module.exports = { createNewUser };
