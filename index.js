const express = require("express")
const dotenv = require("dotenv")
const helmet = require("helmet")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
const mongoose = require("mongoose")
const userRouter = require("./Routes/User")
const authRouter = require("./Routes/Auth")
const categoryRouter = require("./Routes/Category")
const cors = require("cors")
const fileupload = require('express-fileupload');
const productRouter = require("./Routes/Product")


const app = express()
dotenv.config()
mongoose.connect(process.env.MONGODB_URL,{
    
},(err)=>{
    if(err){
        return console.error(err)
    }
    console.log("Connected to Database")
})

app.use(cookieParser());
app.use(express.json())
app.use(cors( { credentials: true,origin:["http://localhost:3000", "https://mandykitchen.netlify.app/"]} ))
app.use(helmet())
app.use(morgan("common"))
app.use(fileupload({useTempFiles: true,createParentPath: true,}))



app.use("/api", userRouter)
app.use("/api/auth", authRouter)
app.use("/api", categoryRouter)
app.use("/api", productRouter)

app.listen(process.env.PORT, ()=>{
    console.log(`server is listening on ${process.env.PORT}`)
})