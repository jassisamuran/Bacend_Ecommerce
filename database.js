const mongoose = require("mongoose");
const dbUrl =
  "mongodb+srv://mani:741852963@cluster0.nw0xkz4.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(dbUrl, {});
const db = mongoose.connection;

db.on("connected", () => {
  console.log(`Database connected to MongoDB`);
});

db.on("error", (error) => {
  console.log(`MongoDB connection error: ${error}`);
});

db.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});

process.on("SIGINT", () => {
  db.close(() => {
    console.log("MongoDB disconnected due to process termination");
    process.exit(0);
  });
});
module.exports = db;
