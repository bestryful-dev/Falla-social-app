import express from "express";

const app = express()

app.get("/", (req,res)=>{
    res.send("server is redy meaw nehaw")
})

app.listen(8000, ()=>{
    console.log("server is runing on port 8000")
})