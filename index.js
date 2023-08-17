const express = require("express")
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")
const mongoose = require("mongoose")
const userRouter = require("./Routes/User")
const authRouter = require("./Routes/Auth")
const cors = require("cors")

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
app.use(cors())
app.use(helmet())
app.use(morgan("common"))

app.use("/api", userRouter)
app.use("/api/auth", authRouter)

app.listen(process.env.PORT, ()=>{
    console.log(`server is listening on ${process.env.PORT}`)
})