const express = require("express")
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")
const mongoose = require("mongoose")
const userRouter = require("./Routes/User")
const authRouter = require("./Routes/Auth")


const app = express()
dotenv.config()
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser:true
},()=>{
    console.log("Connected to Database")
})

app.use(express.json())
app.use(helmet())
app.use(morgan())

app.use("/api", userRouter)
app.use("/api", authRouter)

app.listen(process.env.PORT, ()=>{
    console.log(`server is listening on ${process.env.PORT}`)
})