const express = require("express");
const CategoryModel = require("../Model/CategoryModel");
const ProductsModel = require("../Model/ProductModel");
const { Verify, VerifyRole } = require("../MiddleWare/MiddleWare");

const categoryRouter = express.Router();

//Get all Category
categoryRouter.get("/category", async (req, res) => {
  try {
    const cat = await CategoryModel.find()
      .populate("productId")
      .sort("-createdAt");
    if (cat) {
      return res.status(201).json(cat);
    }
    return res.status(422).json({ error: "Error in getting category" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

//Create A Category
categoryRouter.post("/category", Verify, VerifyRole, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(422).json({ error: "Please Fill all required field" });
    }
    const cat = new CategoryModel({ name });
    const savedCat = await cat.save();
    if (savedCat) {
      return res
        .status(201)
        .json({ savedCat, message: "Category Added Successfully" });
    }
    return res.status(422).json({ error: "Error in creating category" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

//delete  Category
// Verify, VerifyRole
categoryRouter.delete("/category/:id", Verify, VerifyRole, async (req, res) => {
  try {
    const user = await CategoryModel.findById(req.params.id);

    if (!user) {
      return res
        .status(422)
        .json({ error: "Category cannot be found and updated" });
    }
    // if (product) {
    //   product.deleteMany({});
    // }
    if (user) {
      await user.deleteOne();
      await ProductsModel.deleteMany({
        categoryId: req.params.id,
      });
      return res
        .status(201)
        .json({ message: "Category Deleted Successfully", user });
    }
    return res.status(422).json({ error: "Error in Deleting category" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

//Update A Category
categoryRouter.put("/category/:id", Verify, VerifyRole, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(422).json({ error: "Please Fill all required field" });
    }
    const cat = await CategoryModel.findById(req.params.id);
    if (!cat) {
      return res
        .status(422)
        .json({ error: "Category cannot be found and updated" });
    }
    cat.name = name;
    const savedCat = await cat.save();
    if (savedCat) {
      return res.status(201).json({ message: "Category Updated Successfully" });
    }
    return res.status(422).json({ error: "Error in updating category" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

module.exports = categoryRouter;
