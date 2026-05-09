const { Router } = require("express");
const userRouter = Router();

const path = require("path");

const { userModel, todoModel } = require("../db")
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const {z} = require("zod");

userRouter.get("/signup",function(req,res){
    res.sendFile(path.join(__dirname, "..", "Frontend", "signup.html"));
})

userRouter.get("/signin",function(req,res){
    res.sendFile(path.join(__dirname, "..", "Frontend", "signin.html"));
})

userRouter.post("/signup",async function(req,res){
    const { email, password, firstName } = req.body;

    // zod validation
    const requireBody = z.object({
        email : z.string().email().max(50),
        password : z.string().min(3).max(50),
        firstName : z.string().max(50)
    })
    
    const parsedDataWithSuccess = requireBody.safeParse(req.body);
    
    // safeParse returns success and "data or zod error"
    if(!parsedDataWithSuccess.success){
        res.json({
            success: false,
            message : "Incorrect format",
            error : parsedDataWithSuccess.error
        })
        return
    }

    // hashing password
    const hashedPassword = await bcrypt.hash(password, 5)

    // logic
    let isError = false;
    try{
        await userModel.create({
            email: email,
            password: hashedPassword,
            firstName: firstName
        })
    } catch(e){
        res.json({
            success: false,
            message: "User already exist"
        })
        isError = true;
    }

    if(!isError){
        return res.json({
            success: true,
            message: "Signed up successfully"
        })
    }
})

userRouter.post("/signin",async function(req,res){
    const { email, password } = req.body;

    const user = await userModel.findOne({email});

    if(!user){
        return res.json({
            success: false,
            message : "User not found!"
        })
    }

    const passwordMatch = await bcrypt.compare(password,user.password)

    if (!passwordMatch) {
        return res.json({
            success: false,
            message: "Incorrect credentials"
        });
    }

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_USER_PASSWORD)
    
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: "strict"
    });

    return res.json({
        success: true,
        message: "Login successfull"
    })
})

module.exports = {
    userRouter: userRouter
}