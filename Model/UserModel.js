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
    role:{
        type:String,
        default:"000U0"
    },
    verify:{
        type: Boolean,
        required: true,
        default: false,
    },
    profPic:{
        type:String,
        default:""
    }, 
    add:{
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