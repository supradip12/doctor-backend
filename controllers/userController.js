import bcrypt from "bcrypt";
import _ from "lodash";
import otpGenerator from "otp-generator";
import dotenv from "dotenv";
import twilio from "twilio";

import User from "../models/user.js";
import { response } from "express";
dotenv.config();
export const signUp = async (req, res) => {
  try {
    const user = await User({
      name: req.body.name,
      email: req.body.email,
      picturePath: req.body.picturePath,
      password: req.body.password,
      gender: req.body.gender,
    });

    const newUser = await user.save();
    res.status(200).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) res.status(200).send(user);
    if (!user) return res.status(400).json({ msg: "User does not exist. " });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
