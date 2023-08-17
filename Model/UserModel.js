const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    first_name:{
        type:String,
        required:true,
        min:3,
    },
    last_name:{
        type:String,
        required:true,
        min:3,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
        trim: true,
    },
    password:{
        type:String,
        required:true,
        min:5
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    verify:{
        type: String,
        required: true,
        default: '0u00',
    },
    profPic:{
        type:String,
        default:""
    }, 
    resetToken:String,
    expireToken:Date
},
{timestamps:true}
)


const UserModel = mongoose.model("Users", userSchema)

module.exports = UserModel