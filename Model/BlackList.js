const mongoose = require("mongoose")

const BlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    }
  },
  { timestamps: true },
);
const BlackList =  mongoose.model('blacklist', BlacklistSchema);

module.exports = BlackList