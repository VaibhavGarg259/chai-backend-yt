import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "../routes/user.router.js";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); //json access but limit
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //url me kuch specision dota like #* access
app.use(express.static("public")); //file or folder is store
app.use(cookieParser()); //borwer ka data ko access kr or store

//routes import
// import userRouter from "./routes/user.router.js";
//routes declaration
app.use("/api/v1/users", userRouter);

export { app };
