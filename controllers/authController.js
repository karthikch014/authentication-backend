import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

export const registerController = async(req,res)=>{
    const {name,email,password} = req.body;
    if(!name||!email||!password){
        return res.json({success:false,message:"Please provide all fields"});
    }
    try {
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.json({success:false,message:"User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:'1d'});

        res.cookie('token',token,{
            httpOnly:true,
            secure:false,
            sameSite:'strict',
            maxAge: 24*60*60*1000
        })

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to:email,
            subject: "Welcome to our Site",
            text: `Welcome to our site. Your registration successfull with email: ${email}`
        }

        await transporter.sendMail(mailOptions);

        return res.json({success:true,message:"Registartion successfull",user});

    } catch (error) {
        return res.json({success:false,message:"Server error"});
    }
}

export const loginController = async (req,res)=>{
    const{email,password} = req.body;
    if(!email||!password){
        return res.json({success:false,message:"Please provide email and password"});
    }
    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"No user found"});
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({success:false,message:"Invalid credentials"});
        }

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1d'});

        res.cookie('token',token),{
            httpOnly:true,
            secure:false,
            sameSite: 'strict',
            maxAge: 24*60*60*1000
        }

        return res.json({success:true,message:"Login successfull",token,user});
        
    } catch (error) {
        return res.json({success:false,message:"server error"})
    }
}

export const logoutController = async(req,res)=>{
    try{
        res.clearCookie('token');
        return res.json({success:true,message:"Logout successfull"});
    }
    catch(error){
        return res.json({succes:false,message:"Server error"});
    }
}

export const resetOtpController = async(req,res)=>{
    const {email} = req.body;
    if(!email){
        return res.json({success:false,message:"Please provide email"});
    }
    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"No user found"});
        }

        const otp = String(Math.floor(100000+Math.random()*900000));
        user.resetOtp = otp;
        user.resetOtpExpiresAt =  Date.now() + 30*60*1000;
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "RESET PASSWORD REQUEST",
            text: `Your OTP to reset password is ${otp}. It is valid for next 30 minutes.`
        }

        await transporter.sendMail(mailOption);

        return res.json({success:true,message:"OTP-Mail sent successfully"});

    } catch (error) {
        return res.json({success:false,message:"Server error"});
    }
}

export const resetPasswordController = async(req,res)=>{
    const {email,otp,newPassword} = req.body;
    if(!email||!otp||!newPassword){
        return res.json({success:false,message:"Please provide all fields"});
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"No user found"});
        }

        if(user.resetOtp!=otp || user.resetOtp===''){
            return res.json({success:false,message:"Invalid OTP"});
        }

        if(user.resetOtpExpiresAt < Date.now()){
            return res.json({success:false,message:"OTP expired"});
        }

        const hashedPassword = await bcrypt.hash(newPassword,10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpiresAt = 0;
        await user.save();

        return res.json({success:true,message:"Password reset successfull"});

    } catch (error) {
        return res.json({success:false,message:"Server error"});
    }
}
