import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../db/connectDB.js";
import express from "express";

dotenv.config({
  path: "./.env",
});

connectDB();

// import express from "express";
// const app = express();
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("error:", error);
//       throw error;
//     });

//     app.listen(Process.env.PORT, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("ERROR:", error);
//     throw err;
//   }
// })();
