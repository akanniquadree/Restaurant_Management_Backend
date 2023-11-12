const express = require("express")
const CategoryModel = require("../Model/CategoryModel")
const ProductsModel = require("../Model/ProductModel")
const cloudinary = require("cloudinary")
const crypto = require("crypto")
const { Verify, VerifyRole } = require("../MiddleWare/MiddleWare")

const productRouter = express.Router()

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,

  })


//Get all Products
productRouter.get("/product",async(req, res)=>{
    try {
        const product = await ProductsModel.find().populate("categoryId", "name").sort("-createdAt")
        if(product){
            return res.status(200).json(product)
        }
        return res.status(401).json({error:"Error in retrieving products"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error})
    }
})


//Get a single Products
productRouter.get("/product/:id",async(req, res)=>{
    try {
        const product = await ProductsModel.findById(req.params.id).populate("categoryId", "name").sort("-createdAt")
        if(product){
            return res.status(200).json(product)
        }
        return res.status(401).json({error:"Error in retrieving products"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error})
    }
})



//Create A Product
productRouter.post("/product",Verify, VerifyRole, async(req, res)=>{
    try {
        const {name,price,cat, discount, qty, detail,ingredient,time,other} = req.body
        const avatar = req.files.avatar
        if(!name || !price || !qty || !detail || !ingredient || !time || !avatar) {
            return res.status(422).json({error:"Fill all required fields"})
        }
        const existProduct  = await ProductsModel.findOne({name})
        if(existProduct){
            return res.status(422).json({error:"Item name already exist in our record"})
        }
        const code = crypto.randomBytes(4).toString("hex")
        const cate = await CategoryModel.findOne({name:cat})
        if(!cate){
            return res.status(422).json({error:"Category Name doesnt exist in our record"})
        }
        //create a folder in your clodinary
        
        const avatar_clod = await cloudinary.uploader.upload(avatar.tempFilePath,function(res){},{
            folder:`MandyRestuarant/Products/${name}`,
            resource_type:"auto",
            use_filename:true
        })
        if(avatar_clod){
            // let imgs = req.files.imgs
            // let uploadLength = imgs.length
            var uploadRes = []
            
            for(let i=0; i < req.files.imgs.length; i++){
                let img = req.files.imgs[i]
                await cloudinary.uploader.upload(img.tempFilePath,function (res){
                    uploadRes.push(res)
                },{
                    folder:`MandyRestuarant/Products/${name}`,
                    resource_type:"auto",
                    use_filename:true
                })
            }}
            const newProduct = new ProductsModel({
                name,price,code, discount, qty, detail,ingredient,time,other,categoryId:cate._id, avatar:avatar_clod.url,imgs:uploadRes.map((item)=>(item.url))
            })
            const saveProduct = await newProduct.save()
            if(saveProduct){
                        cate.productId.push(saveProduct._id)
                        await cate.save()
                        return res.status(200).json({message:"Product Created Successfully",saveProduct})
                    
            }
    
   
        
        
        //for single upload
        // avatar.mv(path, async(err) => {
        //     if (err) {
        //     return res.status(500).send(err);
        //     }
        //     for(let i = 0 ; i < imgs.length; i++){
        //         const path2 = __dirname + "/Images/Products/" + imgs[i].name
        //         imgs[i].mv(path2, async(err)=>{
    
        //             if(err){
    
        //                 res.send(err);
    
        //             }
        //             const newProduct = new ProductsModel({
        //                 name,price,code, discount, qty, detail,ingredient,time,other, avatar:path,imgs:path2
        //             })
        //             const saveProduct = await newProduct.save()
        //             if(saveProduct){
        //                 return res.status(200).json({message:"Product Created Successfully"})
        //             }
    
        //         })
        //     }
        // });
        //for multiple upload
       
        
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:"error"})
    }
})

//delete  Produt
productRouter.delete("/product/:id",Verify, VerifyRole, async(req, res)=>{
    try {
        const user = await ProductsModel.findById(req.params.id)
        const cat = await CategoryModel.findByIdAndUpdate({_id:item.categoryId},{$pull:{productId:product._id}},{new:true})
        if(!user){
            return res.status(422).json({error:"Product cannot be found and updated"})
        }
        savedCat = user.deleteOne()
        if(savedCat){
            return res.status(201).json({message:"Product Updated Successfully", user})
        }
            return res.status(422).json({error:"Error in deleting category"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error})
    }
})


// //Update A Product
productRouter.put("/product/:id",Verify, VerifyRole, async(req, res)=>{
    try {
        const {name,price,cat, discount, qty, detail,ingredient,time,other} = req.body
        const avatar = req.files.avatar
        const Product = await ProductsModel.findById(req.params.id)
        if(!name || !price || !qty || !detail || !ingredient || !time || !avatar){
            return res.status(422).json({error:"Please Fill all required field"})
        }
        if(!Product){
            return res.status(422).json({error:"Product doesnt exist"})
        }
        const cate = await CategoryModel.findOne({name:cat})
        if(!cate){
            return res.status(422).json({error:"Category cannot be found and updated"})
        }
        const avatar_clod = await cloudinary.uploader.upload(avatar.tempFilePath,function(res){},{
            folder:`MandyRestuarant/Products/${name}`,
            resource_type:"auto",
            use_filename:true
        })
        if(avatar_clod){
            const imgs = req.files.imgs
            const img = imgs[i]
            uploadRes =[]
            for(i=0;i<img.length;i++){
                await cloudinary.uploader.upload(img.tempFilePath,function(res){
                        uploadRes.push(res)
                },{
                    folder:`MandyRestuarant/Products/${name}`,
                    resource_type:"auto",
                    use_filename:true
                })
            }
        }
        Product.name = name
        Product.price = price
        Product.cat = cate._id
        Product.discount = discount
        Product.qty = qty
        Product.detail = detail
        Product.ingredient = ingredient
        Product.time = time
        Product.other = other
        Product.avatar = avatar_clod.url
        Product.imgs = uploadRes.map((itm)=>(itm.url))
        const savedCat = await cat.save()
        if(savedCat){
            await CategoryModel.findOneAndUpdate({productId:Product._id},{$pull:{productId:Product._id}},{new:true})
            await CategoryModel.findOneAndUpdate({name:cat},{$push:{productId:Product._id}},{new:true})
            return res.status(201).json({message:"Product Successfully Updated Successfully"})
        }
            return res.status(422).json({error:"Error in updating category"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error})
    }
})










module.exports = productRouter