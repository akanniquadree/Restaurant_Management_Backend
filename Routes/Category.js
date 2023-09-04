const express = require("express")
const CategoryModel = require("../Model/CategoryModel")
const ProductsModel = require("../Model/ProductModel")
const { Verify, VerifyRole } = require("../MiddleWare/MiddleWare")


const categoryRouter = express.Router()


//Get all Category
categoryRouter.get("/cateogry",Verify, VerifyRole, async(req, res)=>{
    try {
        const cat = await CategoryModel.find().populate("productId").sort("-createdAt")
        if(cat){
            return res.status(201).json(cat)
        }
            return res.status(422).json({error:"Error in getting category"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error})
    }
})

//Create A Category
categoryRouter.post("/cateogry",Verify, VerifyRole, async(req, res)=>{
    try {
        const {name} = req.body
        if(!name){
            return res.status(422).json({error:"Please Fill all required field"})
        }
        const cat = new CategoryModel({name})
        const savedCat = await cat.save()
        if(savedCat){
            return res.status(201).json({message:"Category Added Successfully"})
        }
            return res.status(422).json({error:"Error in creating category"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error})
    }
})

//delete  Category
categoryRouter.delete("/cateogry/:id", Verify, VerifyRole,async(req, res)=>{
    try {
        const cat = await CategoryModel.findById(req.params.id)
        const product = await ProductsModel.findOne({categoryId:req.params.id})
        if(!cat){
            return res.status(422).json({error:"Category cannot be found and updated"})
        }
        cat.deleteOne()
        product.deleteMany()
        if(savedCat){
            return res.status(201).json({message:"Category Updated Successfully"})
        }
            return res.status(422).json({error:"Error in updating category"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error})
    }
})

//Update A Category
categoryRouter.put("/category/:id",Verify, VerifyRole, async(req, res)=>{
    try {
        const {name} = req.body
        if(!name){
            return res.status(422).json({error:"Please Fill all required field"})
        }
        const cat = await CategoryModel.findById(req.params.id)
        if(!cat){
            return res.status(422).json({error:"Category cannot be found and updated"})
        }
        cat.name = name
        const savedCat = await cat.save()
        if(savedCat){
            return res.status(201).json({message:"Category Updated Successfully"})
        }
            return res.status(422).json({error:"Error in updating category"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error})
    }
})










module.exports = categoryRouter