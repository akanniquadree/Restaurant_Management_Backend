const express = require("express")
const UserModel = require("../Model/UserModel")
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sgMail = require("@sendgrid/mail")
const Token = require("../Model/Token")

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

module.exports = authRouter