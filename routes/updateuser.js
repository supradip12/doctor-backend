import User from "../models/user.js";
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from "./verifyToken.js";
import express from "express";
const router = express.Router();

// GET USER Information
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

//UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser); // Return the output
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get the Upcoming Booking
router.get("/upcomingbooking/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const upcomingBooking = user.upcomingbooking;
    console.log(upcomingBooking);
    res.status(200).send(upcomingBooking);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get The Booking History

router.get("/bookinghistory/:id", async (req, res) => {
  try {
    // To get the yesterday

    const user = await User.findById(req.params.id);

    const upcomingBooking = user.upcomingbooking;
    const previousbooking = user.previousbooking;
    let today = new Date();
    let yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let date = yesterday;
    let day = date.getDate().toString().padStart(2, "0");
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let year = date.getFullYear();
    let formattedDate = `${day}-${month}-${year}`;

    for (let i = 0; i < upcomingBooking.length; i++) {
      const booking = upcomingBooking[i];
      if (booking.time === formattedDate) {
        previousbooking.push({
          doctorId: booking.doctorId,
          name: booking.name,
          time: booking.time,
          price: booking.price,
          orderId: booking.orderId,
        });
        upcomingBooking.splice(i, 1);
        i--;
      }
    }

    //   if (Booking[i].time === formattedDate)
    // console.log(upcomingBooking);
    console.log(previousbooking);
    await user.save();
    res.status(200).send(previousbooking);
  } catch (error) {
    console.log(error);
  }
});

//GET USER
router.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL USER
router.get("/", async (req, res) => {
  const query = req.query.new; // For query
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER STATS

router.get("/stats", async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
