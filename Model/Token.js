const mongoose = require("mongoose")

const tokenSchema  = mongoose.Schema({
    token:{
        type:String,
        require:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    },
    expireToken:Date
})

const Token = mongoose.model("Token", tokenSchema)

module.exports = Token