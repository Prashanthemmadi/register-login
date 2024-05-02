const express = require("express");
const mongoose = require("mongoose"); 
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser"); 
const cors = require("cors")
const app = express()  
app.use(bodyParser.json()) 
app.use(cors({origin:'*'}))

// Connecting to Database
const mongoUrl = "mongodb+srv://prashanthemmadi5:prashanth123@cluster0.7fxwigm.mongodb.net/Swiggy?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(mongoUrl).then(()=>{
    console.log("Database connected successfully!")
}) 
.catch((e)=>{
    console.log(e)
}) 

// Defining Schema
const authSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
}) 
const User = mongoose.model('User', authSchema); 

// User Register
const userRegister = async(req,res)=>{
    const {username,email,password} = req.body;
    try{
        const checkEmail = await User.findOne({email}) 
        if(checkEmail){
            return res.status(400).json({warning:"Email already exist!"})
        } 
        const hashedPassword = await bcrypt.hash(password,10) 
        const newUser = new User({
            username,
            email,
            password:hashedPassword
        });
        await newUser.save();
        res.status(200).json({message:"User registerd successfully"}) 
        console.log("Registerd")
 
    }catch(e){
         console.log(e)
          res.status(500).json({error:"Internal server error"})
    }
}
app.post("/register",userRegister)  

// User Login
const userLogin = async(req,res)=>{
    const {email,password} = req.body;
    try{
       const findUser = await User.findOne({email})  
       if(!findUser || !(await bcrypt.compare(password,findUser.password))){
              return res.status(401).json({error:"Invalid username or password"});
       } 

       const jwt_token = jwt.sign({userId:findUser._id},"secretkey",{expiresIn:"100h"})
       res.status(200).json({message:"Login Successfully",jwt_token}) 
       console.log(email)
    }catch(e){
         console.log(e) 
         res.status(500).json("Internal Error")
    }
}
app.post("/login",userLogin)


app.listen(9000,()=>{
    console.log("Server Started")
}); 

app.use("/",(req,res)=>{
    res.send("<h1>Home</h1>")
})