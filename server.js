import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import cloudinary from "cloudinary";

// import { validateTest } from "./middleware/validationMiddleware.js";

//routers
import jobRouter from "./routes/jobRouter.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";

//public

import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import { authenticateUser } from "./middleware/authMiddleware.js";

const app = express();

// const getData = async () => {
//     const response = await fetch('https://www.course-api.com/react-useReducer-cart-project')

//     const cartData = await response.json();
//     console.log(cartData);
// }

// getData().catch((e) => {
//     console.log(e);
// });

// fetch("https://www.course-api.com/react-useReducer-cart-project")
//   .then((res) => res.json())
//   .then((data) => console.log(data));
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.resolve(__dirname, "./client/dist")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());
// app.use(morgan('dev'));
app.use(express.json());
// app.use(helmet());

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults : true,
      directives: {
        "img-src": ["'self'", "https: data: blob:"],
      },
    },
  })
);

app.use(mongoSanitize());

// app.get("/", (req, res) => {
//   res.send("Hello world");
// });

// app.get("/api/v1/test", (req, res) => {
//   res.json({ msg: "test route" });
// });

// app.post(
//   "/api/v1/test",
//   validateTest,
//   (req, res) => {
//     const { name } = req.body;
//     res.json({ message: `hello ${name}`, data: req.body });
//   }
// );

// app.post("/", (req, res) => {
//   console.log(req);
//   res.json({ message: "data received", data: req.body });
// });

//GET ALL JOBS
// app.get('/api/v1/jobs',)

//CREATE JOB
// app.post('/api/v1/jobs',)

// GET SINGLE JOB

// app.get('/api/v1/jobs/:id',)

//EDIT/UPDATE JOB

// app.patch('/api/v1/jobs/:id',)

//DELETE JOB

// app.delete('/api/v1/jobs/:id',)

app.use("/api/v1/jobs", authenticateUser, jobRouter);
app.use("/api/v1/users", authenticateUser, userRouter);
app.use("/api/v1/auth", authRouter);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/dist", "index.html"));
});

app.use("*", (req, res) => {
  res.status(404).json({ msg: "not found" });
});

app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`server running on PORT ${port}...`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
