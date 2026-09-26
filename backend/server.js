import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js"
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();
const app = express()
app.use (express.json());
app.use(cookieParser()); 
app.use(express.urlencoded({extended:true}))

// console.log(process.env.MONGO_URI)

app.use("/api/auth",authRoutes)

const port = process.env.PORT || 5000

app.listen(port, ()=>{
    console.log(`server is runing on ${port} `)
    connectMongoDB();
})