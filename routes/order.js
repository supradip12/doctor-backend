import Order from "../models/Order.js";
import User from "../models/user.js";
import Doctor from "../models/doctor.js";
import express from "express";
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from "./verifyToken.js";

const router = express.Router();

//CREATE

router.post("/", async (req, res) => {
  const savedOrder = new Order(req.body);

  try {
    const user = await User.findById(savedOrder.userId);
    const doctor = await Doctor.findById(savedOrder.doctorId);
    const orderId = savedOrder._id;

    // console.log(user);
    // console.log(doctor);
    const time = savedOrder.date;
    const Amount = savedOrder.amount;

    // let time = new Date(Date.parse(Stime, "dd-MM-yyyy"));

    let serialNo = 0;
    for (let booking of doctor.Booking) {
      if (booking.time === time) {
        serialNo++;
      }
    }

    let noti = "This is message";
    if (serialNo < 20) {
      User.findByIdAndUpdate(
        user._id,
        {
          $push: { notification: noti },
        },
        function (err, user) {
          user.notification.push(noti);
        }
      );
    }

    let Upcomingbooking = {
      doctorId: doctor._id,
      name: doctor.name,
      time: time,
      serial: serialNo + 1,
      price: Amount,
      orderId: orderId,
    };

    if (serialNo < 20) {
      User.findByIdAndUpdate(
        user._id,
        {
          $push: { upcomingbooking: Upcomingbooking },
        },
        function (err, user) {
          user.upcomingbooking.push(Upcomingbooking);
        }
      );
    }

    let booking = {
      userId: user._id,
      name: user.name,
      time: time,
      price: Amount,
      orderId: orderId,
    };
    console.log("serialNo is  " + serialNo);
    if (serialNo < 20) {
      Doctor.findByIdAndUpdate(
        doctor._id,
        {
          $push: { Booking: booking },
        },
        function (err, doctor) {
          doctor.Booking.push(booking);
        }
      );
    }

    if (serialNo < 20) {
      const newOrder = await savedOrder.save();

      res.status(200).json(newOrder);
    } else {
      res.status(401).json("Order not done");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER ORDERS
router.get("/find/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// //GET ALL

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/admin", async (req, res) => {
  try {
    Order.find()
      .populate("userId")
      .populate("doctorId")
      .then(async (data) => {
        const orders = await Promise.all(
          data.map(async (order) => {
            return {
              _id: order._id,
              userName: order.userId?.name,
              doctorName: order.doctorId?.name,
              date: order.date,
              amount: order.amount,
            };
          })
        );
        res.status(200).json(orders);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: "Error retrieving orders" });
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET MONTHLY INCOME

router.get("/income", async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
