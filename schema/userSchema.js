const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  userType: { type: String, enum: ["buyer", "seller"] },
});

const catalogSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
});

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  products: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
});

const User = mongoose.model("User", userSchema);
const Catalog = mongoose.model("Catalog", catalogSchema);
const Order = mongoose.model("Order", orderSchema);

module.exports = {
  User,
  Catalog,
  Order,
};
