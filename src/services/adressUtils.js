const Address = require("../model/Address");

const findAddressById = async (id) => {
  return await Address.findById(id);
};

const createAddress = async (req) => {
  return await Address.create({
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
};

module.exports = {
  findAddressById,
  createAddress,
};
