const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const memberSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      default: Date.now,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

/*------------------------------------------------------------------------------------------------------------------*/
/* JWT token Generation while registration process */



memberSchema.methods.generateAuthToken = async function () {
  try {
    const token = await jwt.sign({ _id: this.id }, process.env.SECRET_KEY);
    //this.tokens refers the tokens id  in document
    this.tokens = this.tokens.concat({ token: token }); //{documentTokenId:generatedToken }
    return token;
  } catch (error) {
    res.send("the error part" + error);
    // console.log("the error part" + error);
  }
};

/*-----------------------------------------------------------------------------------------------------------------*/
/* Hashing the password ,Secure Password */
/* secure your password with hashing technique. require bcrypt in app.js <==> registers.js */


memberSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    console.log(`the current password is ${this.password}`);

    // <-------  hashing the password via bcrypt with 10 rounds.and save the hash in same variable    ------>
    this.password = await bcrypt.hash(this.password, 10);
    console.log(` password hash is ${this.password}`);

    // <------  current password field is just use for user awareness. so don't save it in database  ------>
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, 10);
    console.log(` confirmPassword  hash is ${this.confirmPassword}`);
    next();
  }
});
/*---------------------------------------------------------------------------------------------------------------------*/

/*---------------------------------------*/
/*  WE NEED TO CREATE COLLECTION */
/*---------------------------------------*/

const RegisteredMember = new mongoose.model("RegisteredMember", memberSchema);

module.exports = RegisteredMember;
