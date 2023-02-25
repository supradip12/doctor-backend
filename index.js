import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/user.js";
import userRouter from "./routes/updateuser.js";

import docauth from "./routes/doctor.js";
import doctorRouter from "./routes/updatedDoc.js";

import orderRoute from "./routes/order.js";

// configuration.. (MiddleWare: Function are running).

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
// File Storage...

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets"); //When some one upload a file it will store a in this directory.
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ Storage });

// Client Side
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// DoctorSide
app.use("/api/docauth", docauth);
app.use("/api/doctor", doctorRouter);

// Order
app.use("/api/order", orderRoute);

// MONGOOSE SETUP
const PORT = process.env.PORT || 6001;
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server is Running ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not Connect`));
