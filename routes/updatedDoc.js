import Doctor from "../models/doctor.js";
import User from "../models/user.js";
import { verifydocToken, verifyTokenAndAuthorization } from "./verifyDoc.js";
import express from "express";

const router = express.Router();

// GET Dcotor Information
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    res.status(200).json(doctor);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

//UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(updatedUser); // Return the output
  } catch (err) {
    res.status(500).json("Problem");
  }
});

// User update Reviews
// router.put("/:id", async (req, res) => {
//   try {
//     const updatedUser = await Doctor.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: req.body,
//       },
//       { new: true }
//     );
//     res.status(200).json(updatedUser); // Return the output
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

router.delete("/delete/:id", async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.status(200).json("Doctor has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get Today's patient Count
router.get("/todaycount/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    const Booking = doctor.Booking;
    const Todaybooking = doctor.TodayBooking;
    const today = new Date();

    const formattedDate = today
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
    // console.log("koira hala  " + formattedDate);
    // console.log(Booking[i].time + "and" + formattedDate);

    for (let i = 0; i < Booking.length; i++) {
      console.log("enter");
      if (Booking[i].time === formattedDate) {
        Todaybooking.push(Booking[i]);
        Booking.splice(i, 1);
        i--;
      }
    }
    // console.log(Booking);
    // console.log("and");
    // console.log(Todaybooking);
    // console.log(str);
    // res.status(200).send(str);
    // update
    await doctor.save();
    let str = Todaybooking.length.toString();

    res.status(200).send(str);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/bookinghistory/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    const bookHistory = doctor.BookHistory;

    res.status(200).send(bookHistory);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get next patient
router.get("/nextpatent/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    // console.log(doctor);

    const TodayBooking = doctor.TodayBooking;
    const BookingHistory = doctor.BookHistory;

    const poppedElement = TodayBooking.shift();
    // console.log()
    const patpic = await User.findById(poppedElement.userId);
    // console.log(patpic.picturePath);
    BookingHistory.push({
      userId: poppedElement.userId,
      name: poppedElement.name,
      time: poppedElement.time,
      orderId: poppedElement.orderId,
      patpicture: patpic.picturePath,
    });
    const userId = poppedElement.userId;
    const user = await User.findById(userId);

    const upcomingBooking = user.upcomingbooking;
    const previousbooking = user.previousbooking;
    const popedOrder = poppedElement.orderId;
    for (let i = 0; i < upcomingBooking.length; i++) {
      const booking = upcomingBooking[i];
      const docid = popedOrder.toString();
      const userid = booking.orderId;
      const userorder = userid.toString();

      if (docid === userorder) {
        previousbooking.push({
          doctorId: booking.doctorId,
          name: booking.name,
          time: booking.time,
          price: booking.price,
          docpicture: booking.docpicture,
        });

        console.log("After Entering id Condition");
        upcomingBooking.splice(i, 1);
        i--;
        break;
      }
    }

    await doctor.save();
    await user.save();

    const remainng = TodayBooking.length;
    const remainpatient = remainng.toString();
    res.status(200).json(remainpatient);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Serach Doc
router.post("/searchdoc", async (req, res) => {
  try {
    // error control
    var search = req.body.search;
    var serachdata = await Doctor.find({
      name: { $regex: ".*" + search + ".*", $options: "i" },
    });
    if (serachdata.length > 0) {
      res.status(200).json(serachdata);
    } else {
      res.status(200).json("Doctor not found!");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get All doctor Information
// router.get("/", async (req, res) => {
//   const qNew = req.query.new;
//   const qCategory = req.query.Specialist;
//   try {
//     let doctor;

//     if (qNew) {
//       doctor = await Doctor.find().sort({ createdAt: -1 }).limit(1);
//     } else if (qCategory) {
//       doctor = await Doctor.find({
//         Specialist: {
//           $in: [qCategory],
//         },
//         online: true,
//       });
//     } else {
//       doctor = await Doctor.find({ online: true });
//     }

//     res.status(200).json(doctor);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// Get All doctor Information

router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.Specialist;
  const qPrice = req.query.amount;

  try {
    let doctor;

    if (qNew) {
      doctor = await Doctor.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      doctor = await Doctor.find({
        Specialist: {
          $in: [qCategory],
        },
        online: true,
        price: qPrice, // filter by price query parameter
      });
    } else {
      doctor = await Doctor.find({ online: true, price: qPrice }); // filter by price query parameter
    }

    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
