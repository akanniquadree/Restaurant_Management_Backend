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
        unique:true
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
        type:Boolean,
        default:false
    },
    profPic:{
        type:String,
        default:""
    }, 
},
{timestamps:true}
)


const UserModel = mongoose.model("Users", userSchema)

module.exports = UserModel