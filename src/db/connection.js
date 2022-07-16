require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log(`connection successful`);
  })
  .catch((e) => {
    console.log(`No connection`);
  });
