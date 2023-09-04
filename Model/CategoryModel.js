const mongoose = require("mongoose")

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      uppercase: true
    },
    productId:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Products"
      }
  ]
  },
  { timestamps: true },
);
const CategoryModel =  mongoose.model('Category', CategorySchema);

module.exports = CategoryModel