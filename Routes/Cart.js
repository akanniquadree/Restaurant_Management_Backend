const express = require("express");
const { Verify } = require("../MiddleWare/MiddleWare");
const CartModel = require("../Model/CartModel");
const ProductsModel = require("../Model/ProductModel");

const cartRouter = express.Router();

// create Cart
cartRouter.post("/cart", Verify, async (req, res) => {
  try {
    const { productId, qty } = req.body;
    //   Check for the product in the product Model
    const product = await ProductsModel.findById(productId);
    // Check if the User has existing cartItem
    let cart = await CartModel.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new CartModel({
        userId: req.user._id,
      });
    }
    //check if the product is already in the User Cart
    const existingItem = cart.item.find(
      (item) => item.product.toString() === productId.toString()
    );
    if (existingItem) {
      // update the quantity and price
      existingItem.itemPrice = product.discount * (qty + existingItem.qty);
      existingItem.qty += qty;
    } else {
      cart.item.push({
        product: productId,
        qty: qty,
        itemPrice: product.discount * qty,
      });
    }
    // Calculating the total Item
    cart.totalItem = cart.item.reduce((total, item) => total + item.qty, 0);
    cart.totalPrice = cart.item.reduce((acc, item) => {
      return acc + item.itemPrice;
    }, 0);

    const savedCart = await cart.save();
    if (savedCart) {
      return res
        .status(200)
        .json({ message: "Product Successfully Added", cart });
    }
    return res.status(422).json({ error: "Error in updating cart" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error" });
  }
});

// Update Cart
cartRouter.put("/cart/:id", Verify, async (req, res) => {
  try {
    const { qty } = req.body;
    let cart = await CartModel.findOne({ userId: req.user._id })
      .populate()
      .sort("-createdAt");
    const product = await ProductsModel.findById(req.params.id);
    if (!cart) {
      return res.status(404).json({ error: "Cart cannot be found" });
    }
    const existingCart = cart.item.find(
      (item) => item.product.toString() === req.params.id.toString()
    );
    if (!existingCart) {
      return res.status(404).json({ error: "Product not found in the cart" });
    }

    existingCart.qty = qty;
    existingCart.itemPrice = product.discount * qty;
    cart.totalItem = cart.item.reduce((acc, items) => acc + items.qty, 0);
    cart.totalPrice = cart.item.reduce(
      (acc, items) => acc + items.qty * product.discount,
      0
    );
    const saveCart = await cart.save();
    if (saveCart) {
      return res
        .status(200)
        .json({ message: "Product Successfully Updated", cart });
    }
    return res.status(422).json({ error: "Error in updating cart" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// Remove Item From Cart
cartRouter.delete("/cart/:id", Verify, async (req, res) => {
  try {
    let cart = await CartModel.findOne({ userId: req.user._id });
    const product = await ProductsModel.findById(req.params.id);
    if (!cart) {
      return res.status(404).json({ error: "Cart cannot be found" });
    }
    cart.item = cart.item.filter(
      (item) => item.product.toString() !== req.params.id.toString()
    );
    cart.totalItem = cart.item.reduce((acc, items) => acc + items.qty, 0);
    cart.totalPrice = cart.item.reduce(
      (acc, items) => acc + items.qty * product.discount,
      0
    );
    const saveCart = await cart.save();
    if (saveCart) {
      return res
        .status(200)
        .json({ message: "Product removed successfully", cart });
    }
    return res.status(422).json({ error: "Error in removing cart" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// Empty All Cart Items
cartRouter.delete("/cart", Verify, async (req, res) => {
  try {
    let cart = await CartModel.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart cannot be found" });
    }
    cart.item = [];
    cart.totalItem = 0;
    cart.totalPrice = 0;
    const saveCart = await cart.save();
    if (saveCart) {
      return res
        .status(200)
        .json({ message: "Product Successfully Deleted", cart });
    }
    return res.status(422).json({ error: "Error in deleted cart" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// Get all cart
cartRouter.get("/cart", Verify, async (req, res) => {
  try {
    // Check if the User has existing cartItem
    let cart = await CartModel.findOne({ userId: req.user._id })
      .populate()
      .sort("-createdAt");
    if (!cart) {
      return res.status(404).json({ error: "Cart is Empty" });
    }
    return res.status(200).json(cart);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error" });
  }
});
module.exports = cartRouter;
