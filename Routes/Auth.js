const express = require("express")
const UserModel = require("../Model/UserModel")
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sgMail = require("@sendgrid/mail")
const Token = require("../Model/Token")
const crypto = require("crypto")


const authRouter = express.Router()
dotenv.config()
sgMail.setApiKey(process.env.SENDGRID_TRANSPORT)

authRouter.post("/register", async(req, res)=>{
    try {
        const {email,first_name,last_name, password, conPassword, } = req.body
        if(!email || !password || !first_name || !last_name || !conPassword){
            return res.status(403).json({error:"Please Fill All Required Fields"})
        }
        if(password !== conPassword){
            return res.status(403).json({error:"Password Doesnt Match"}) 
        }
        const existEmail = await UserModel.findOne({email:email})
        if(existEmail){
            return res.status(403).json({error:"Email already exist in our record"})
        }
        const salt = await bcrypt.genSalt(13)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = new UserModel({
            email,first_name,last_name,password:hashedPassword,
        })
        const savedUser = await user.save()
        if(savedUser){
            const jwToken = jwt.sign({_id:savedUser._id}, process.env.JWT_ACTIVATION)
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
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error})
    }
})

authRouter.post("/signin", async(req, res)=>{
    try {
        const {email, password} = req.body
        // let conditions = (cred.indexOf("@") === -1) ? {username: cred} : {email: cred}
        if(!email || !password){
            return res.status(422).json({error:"Please fill all fields"})
        }
        const user = await UserModel.findOne({email:email})
        if(!user){
            return res.status(422).json({error:"You have entered a wrong credentials"})
        }
        const verifyPassword = await bcrypt.compare(password, user.password)
        if(!verifyPassword){
            return res.status(422).json({error:"You have entered a wrong credentials"})
        } 
        if(!user.verify){
            const TokenSave = await Token.findOne({userId:user._id})
            const jwToken = jwt.sign({_id:user._id}, process.env.JWT_ACTIVATION)
            if(!TokenSave){
                const token = new Token({
                    token:jwToken,
                    userId:user._id,
                    expireToken: Date.now() + 3600000
                })
                const savedToken = await token.save()
                if(savedToken){
                    const url = `${process.env.BASE_URL}/user/${user._id}/verify/${jwToken}`
                    const send = {
                        to:user.email,
                        from:"akanniquadry7@gmail.com",
                        subject: "ACCOUNT VERIFICATION",
                        html:`
                            <h4>Verify your email by clicking this </h4>
                            <p><a href="${url}">${url}</a></p>
                            <p>The Url expires in an hour</p>
                        `
                    }
                    sgMail.send(send).then(sent=>{
                        return res.status(201).json({message: "A mail has been sent to your Email, please verify your email"})
                    }) 
                }
            }
            if(TokenSave){
                TokenSave.token = jwToken
                TokenSave.expireToken = Date.now() + 3600000
               const savedToken = await TokenSave.save()
                if(savedToken){
                    const url = `${process.env.BASE_URL}/user/${user._id}/verify/${jwToken}`
                    const send = {
                        to:user.email,
                        from:"akanniquadry7@gmail.com",
                        subject: "ACCOUNT VERIFICATION",
                        html:`
                            <h4>Verify your email by clicking this </h4>
                            <p><a href="${url}">${url}</a></p>
                            <p>The Url expires in an hour</p>
                        `
                    }
                    sgMail.send(send).then(sent=>{
                        return res.status(201).json({message: "A mail has been sent to your Email, please verify your email"})
                    }) 
                }
            }
        }
        else{
            const tokenHeader = jwt.sign({_id:user._id},process.env.JWT_HEADER,{expiresIn:"360000"})
            const {password, ...others} = user._doc
            return res.status(200).json({others, tokenHeader})
        }
        
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error})
    }
})

authRouter.get("/user/:id/verify/:token",async(req, res)=>{
    try {
        const user = await UserModel.findById(req.params.id)
        const token = await Token.findOne({token:req.params.token})
        if(!user){
            return res.status(401).json({error:"Invalid User Account"})
        }
        if(!token){
             return res.status(401).json({error:"Invalid Token"})
        }
        const notExpireToken = Token.findOne({userId:user._id, expireToken:{$gt:Date.now}})
        if(!notExpireToken){
            return res.status(404).json({error:"The Link has expire, Please Log in again to reset link"})
        }
        user.verify = true
        const update = await user.save()
        if(update){
            await Token.deleteOne()
            return res.status(200).json({message:"Email has been verified"})
        }
    } catch (error) {
        return res.status(500).json({error:error})
    }
})

authRouter.post("/resetpassword", async(req, res)=>{
    try {
        const {email} = req.body
        if(!email){
            return res.status(422).json({error:"Please fill in all details"})
        }
        const user  = await UserModel.findOne({email:email})
        if(!user){
            return res.status(422).json({error:"Email doesnt exist in our record"})
        }
        const token = crypto.randomBytes(32).toString("hex")
        user.resetToken = token
        user.expireToken = Date.now() + 3600000
        const savedUser = await user.save()
        if(savedUser){
            const url = `${process.env.BASE_URL}/user/${user._id}/resetpassword/${token}`
            const send = {
                to:`${user.email}`,
                from:"akanniquadry7@gmail.com",
                subject:"RESET PASSWORD",
                html: `<p>Click on the link below to reset your password</p>
                        <a href=${url}>${url}</a>
                        <p>Link expires in an hour</p>`
            }
            sgMail.send(send).then(sent=>{
                return res.status(201).json({message: "A mail has been sent to your mail to reset your password"})
            }) 
        }
    } catch (error) {
        return res.status(500).json(error)
    }
})

authRouter.get("/user/:id/resetpassword/:token", async(req, res)=>{
    try {
        const user = await UserModel.findById(req.params.id)
        if(!user){
            return res.status(400).json({error:"Invalid Link"})
        }
        if(user.resetToken !== req.params.token){
            return res.status(400).json({error:"Invalid Link"})
        }
        return res.status(200).json()
    } 
    catch (error) {
        return res.status(500).json(error)
    }
})
authRouter.post("/user/:id/resetpassword/:token", async(req, res)=>{
    try {
        const {password, conPassword} = req.body
        if(!password, !conPassword){
            return res.status(422).json({error:"Please fill all required details"})
        }
        if(password !== conPassword){
            return res.status(422).json({error:"Password doesnot match"})
        }
        const user = await UserModel.findById(req.params.id)
        if(!user){
            return res.status(400).json({error:"Invalid Link"})
        }
        if(user.resetToken !== req.params.token){
            return res.status(400).json({error:"Invalid Link"})
        }
        const Notexpire = await UserModel.findOne({resetToken:req.params.token, expireToken:{$gt:Date.now()}})
        if(!Notexpire){
            return res.status(400).json({error:"Please try again, Session Expired"})
        }
        const salt = await bcrypt.genSalt(13)
        const hashedPassword = await bcrypt.hash(password, hashedPassword)
        user.password = hashedPassword
        user.resetToken = undefined
        user.expireToken = undefined
        const newpassword = await user.save
        if(newpassword){
            return  res.status(200).json({message:"Password successfully updated"})
        }
    } 
    catch (error) {
        return res.status(500).json(error)
    }
})

module.exports = authRouter