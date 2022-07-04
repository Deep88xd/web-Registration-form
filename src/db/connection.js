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


// mongoose
//   .connect(process.env.DATABASE_URL)
//   .then(() => {
//     app.listen(port, () => {
//       `Connecting to the server at port no. ${port}`;
//     });
//   })
//   .catch((error) => {
//     console.log(error);
//   });
