import bcrypt from "bcrypt";
import _ from "lodash";
import otpGenerator from "otp-generator";
import dotenv from "dotenv";
import twilio from "twilio";

import Doctor from "../models/doctor.js";
import Otp from "../models/otpModel.js";
import { response } from "express";
dotenv.config();
export const signUp = async (req, res) => {
  try {
    const user = await Doctor({
      name: req.body.name,
      email: req.body.email,
      picturePath: req.body.picturePath,
      address: req.body.address,
      Specialist: req.body.Specialist,
      amount: req.body.amount,
      stats: {
        studied: req.body.stats.studied,
        experience: req.body.stats.experience,
        number: req.body.stats.number,
        off: req.body.stats.off,
        patientcount: req.body.stats.patientcount,
      },
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
    const doctor = await Doctor.findOne({ email: email });
    if (doctor) res.status(200).send(doctor._id);
    if (!doctor)
      return res.status(400).json({ msg: "Doctor does not exist. " });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
