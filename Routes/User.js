const express = require("express")
const { Verify, VerifyRole } = require("../MiddleWare/MiddleWare")
const cloudinary = require("cloudinary")
const UserModel = require("../Model/UserModel")
const crypto = require("crypto")
const sgMail = require("@sendgrid/mail")
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")

const userRouter = express.Router()
dotenv.config()
sgMail.setApiKey(process.env.SENDGRID_TRANSPORT)


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,

  })
//Update User
// userRouter.put("/update", ())


// get all users
userRouter.get("/user",Verify,VerifyRole, async(req, res)=>{
    try {
        const user = await UserModel.find().sort("-createdAt")
        if(user){
            return res.status(201).json(user)
        }
    } catch (error) {
            console.log(error)
            return res.status(500).json(error)
    }
})
// get a users
userRouter.get("/user/:id", async(req, res)=>{
    try {
        const user = await UserModel.findById(req.params.id)
        if(!user) { return res.status(422).json({error:"Invalid User"})}
            return res.status(201).json(user)
    } catch (error) {
            console.log(error)
            return res.status(500).json(error)
    }
})
//update User
userRouter.put("/user/:id",Verify, async(req, res)=>{
    try {
        if(req.user._id.toString() !== req.params.id || req.user.role === "0A10" ){
            return res.status(422).json({error:"You can only update your account"})
        }
        const user =  await UserModel.findById(req.params.id)
        if(!user){return res.status(422).json({error:"Invalid User"})}
        const {first_name,phone,last_name,add} = req.body
        if(!first_name || !last_name||!phone || !add){
            return res.status(422).json({error:"Please Fill All Required Fields"})
        }
        user.last_name = last_name
        user.first_name = first_name
        user.add = add
        user.phone =phone
        const updateUser = await user.save()
        if(updateUser) { return res.status(200).json({message:"User Updated Successfully", updateUser})}
            return res.status(422).json({error:"Error in editing user"})
    } catch (error) {
            console.log(error)
            return res.status(500).json(error)
    }
})
//Update User picture
userRouter.put("/user/pic/:id",Verify, async(req, res)=>{
    try {
        if(req.user._id.toString() !== req.params.id || req.user.role === "0A10" ){
            return res.status(422).json({error:"You can only update your account"})
        }
        const user =  await UserModel.findById(req.params.id)
        if(!user){return res.status(422).json({error:"Invalid User"})}
        const picture = req.files.profPic
        const profieCloud = await cloudinary.UploadStream.upload(picture.tempFilePath,function(res){},{
            folder:`MandyRestuarant/Users/${user.email}`,
            resource_type:"auto",
            use_filename:true
        })
        if(profieCloud){
            user.profPic = profieCloud.url
            const savedUser = await user.save()
            if(savedUser){
                return res.status(200).json({mesage:"Profile Picture Uploaded Successfully", savedUser})
            }
              return res.status(422).json({error:"Error in updating user"})
        }
          return res.status(422).json({error:"Error in uplading picture"})
    } catch (error) {
            console.log(error)
            return res.status(500).json(error)
    }
})

userRouter.post("/user/newpassword/:id", Verify, async(req, res)=>{
    try {
        if(req.user._id.toString() !== req.params.id || req.user.role === "0A10" ){
            return res.status(422).json({error:"You can only update your account"})
        }
        const {oldPassword, newPassword, conPassword} = req.body
        if(!newPassword || !conPassword || !oldPassword){
            return res.status(422).json({error:"Please fill all fields"})
        }  
        if(newPassword !== conPassword){
            return res.status(422).json({error:"Password does not match"})
        }
        const user = await UserModel.findById(req.user._id)
        if(!user){
        return res.status(400).json({error:"User cannot be found"})
        }
        const correctpassword = await bcrypt.compare(oldPassword, user.password)
        if(!correctpassword){
            return res.status(400).json({error:"Please enter the correct old password"})
        }
        const salt = await bcrypt.genSalt(13)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        user.password = hashedPassword
        const savedpassword = await user.save()
        if(savedpassword){
            return  res.status(200).json({message:"Password successfully updated"})
        }
        return  res.status(400).json({error:"Error in updating password"})

    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})

//delete User
userRouter.delete("/user/:id",Verify, async(req, res)=>{
    try {
        if(req.user._id.toString() !== req.params.id || req.user.role === "0A10" ){
            return res.status(422).json({error:"You can only delete your account"})
        }
        const user =  await UserModel.findByIdAndDelete(req.params.id)
        if(user){return res.status(422).json({message:"User Delete Successfully "})}
        return res.status(422).json({error:"Error in deleting user"})
    } catch (error) {
            console.log(error)
            return res.status(500).json(error)
    }
})

//admin add user
authRouter.post("/user/admin", Verify,VerifyRole,async(req, res)=>{
    try {
        const {email,first_name,last_name, password, verify,role,add,phone } = req.body
        if(!email || !password || !first_name || !last_name || !add  ||!phone||!role||!verify){
            return res.status(403).json({error:"Please Fill All Required Fields"})
        }
        const existEmail = await UserModel.findOne({email:email})
        if(existEmail){
            return res.status(403).json({error:"Email already exist in our record"})
        }
        const salt = await bcrypt.genSalt(13)
        const hashedPassword = await bcrypt.hash(password, salt)
        const picture = req.files.profPic
        const profieCloud = await cloudinary.UploadStream.upload(picture.tempFilePath,function(res){},{
            folder:`MandyRestuarant/Users/${user.email}`,
            resource_type:"auto",
            use_filename:true
        })
        if(!profieCloud){
            return res.status(422).json({error:"Error in uplading picture"})
        }
          
        const user = new UserModel({
            email,first_name,last_name,password:hashedPassword,verify,role,add,phone,profPic:profieCloud.url
        })
        const savedUser = await user.save()
        if(savedUser){
            if(verify === false){
                const jwToken = crypto.randomBytes(84).toString("hex")
                const token = new Token({
                    token:jwToken,
                    userId:savedUser._id,
                    expireToken: Date.now() + 3600000
                })
                const savedToken = await token.save()
                if(savedToken){
                    const url = `${process.env.BASE_URL}/user/${savedUser._id}/verify/${jwToken}`
                    const send = {
                        to:savedUser.email,
                        from:"akanniquadry7@gmail.com",
                        subject: "ACCOUNT VERIFICATION",
                        html:`
                            <h4>Verify your email by clicking this </h4>
                            <p><a href="${url}">${url}</a></p>
                        `
                    }
                    sgMail.send(send).then(sent=>{
                        return res.status(201).json({message: "A mail has been sent to your Email, please verify your email"})
                    }) 
                }
            }
            else{
                return res.status(201).json({message: "User created successfully"})
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error})
    }
})

module.exports = userRouter