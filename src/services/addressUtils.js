const Address = require("../model/Address");

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

module.exports = {
  createAddress,
};
