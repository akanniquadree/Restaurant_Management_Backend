const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
   name: {
      type: String,
      required: true,
      unique:true
    },
    code:{
      type: String,
    },
    price:{
      type: String,
      required:true,
      trim:true
    },
    discount:{
      type: String,
      trim:true
    },
    qty:{
      type: Number,
      default: 1,
      required:true,
      trim:true
    },
    detail:{
      type: String,
      required:true,
    },
    ingredient:{
      type:  String,
      required:true,
    },
    time:{
      type:  String,
      required:true,
    },
    other:{
      type:  String,
    },
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    avatar:{
        type:  String,
        required:true,
      
    },
    imgs:[{
      type:  String,
    }]
  },
  { timestamps: true },
);
const ProductsModel =  mongoose.model('Products', productSchema);

module.exports = ProductsModel