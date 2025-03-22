const mongoose = require("mongoose");
const User = require("../model/User");
const bcrypt = require("bcryptjs");

const createNewUser = async (req, res) => {
  if (
    !req?.body?.username ||
    !req?.body?.email ||
    !req?.body?.phone ||
    !req?.body?.password
  ) {
    return res.status(400).json({
      message:
        "To create an account, you need to fill the required fields(username, user-type, email, phone and password).",
    });
  }

  const duplicate = await User.findOne({
    username: req.body.username,
    roles: req.body.roles,
  }).exec();

  if (duplicate) return res.sendStatus(409); // conflict
  try {
    // encrypt the password
    const hashedPwd = await bcrypt.hash(req.body.password, 10);
    const newUser = await User.create({
      username: req.body.username,
      roles: req.body.roles,
      lastname: req.body.lastname,
      password: hashedPwd,
      email: req.body.email,
      phone: req.body.phone,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });
    console.log(newUser);
    return res.status(201).json(newUser);
  } catch (error) {
    // throw new Error(`Error creating user: ${error.message}`);
    console.log(error);
    return res.status(400).json({
      message: `Error creating user: ${error.message}`,
    });
  }
};

module.exports = { createNewUser };
