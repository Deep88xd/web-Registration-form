require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const path = require("path");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
require(`./db/connection`);

const port = process.env.PORT || 8000;

const Register = require("./models/registers");

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});
/*----------------------------------------------------------------------------------------------------------------------------*/
/*To visit premium page */

app.get("/premium", auth, (req, res) => {
  console.log(
    `this is the token generated when we visit the premium page ${req.cookies.jwt}`
  );
  res.render("premium");
});
/*----------------------------------------------------------------------------------------------------------------------------*/
app.get("/register", (req, res) => {
  res.render("register");
});
/*----------------------------------------------------------------------------------------------------------------------------*/
/* Registration form */
/*Add data in Database during Registration Process  */

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmPassword;
    console.log(`the password value from form field is ${password}`);

    if (password === cpassword) {
 
      const registered = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: password,
        confirmPassword: cpassword,
      });
      console.log("document is " + registered);
      /*----------------------------------------------------------------------------------------------------------------------------*/

      /*----------------------------------------------------------------------------------------------------------------------------*/
     
      const registrationToken = await registered.generateAuthToken();
      console.log(
        ` the generated token while registration process is ${registrationToken}`
      );
      /*-------------------------------------------------------------------------------------------------*/
      /*store token in cookies on submit the registration button*/

      res.cookie("jwt", registrationToken, {
        expires: new Date(Date.now() + 900000),
        httpOnly: true,
        secure: true,
      });
      /*-------------------------------------------------------------------------------------------------*/
     
      /* secure your password with hashing technique. */
      // before save data in database secure your password with hashing technique. in register.js.
      /*-----------------------------------------------------------------------------------------------------------------------------*/

      const register = await registered.save();
      console.log("registered Document is");
      console.log(register);
      res.status(201).render("index");
    } else {
      res.send("password are not matching");
    }
  } catch (error) {
    res.status(400).send("the page error");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

/*------------------------------------------------------------------------------------------------------*/
/*Login in form without Encryption */
/* just Compare entered password and password stored in database */
/*------------------------------------------------------------------------------------------------------*/

app.post("/login", async (req, res) => {
  try {
    // get email & password value from the form body.
    const email = req.body.email;
    const password = req.body.password;

  
    const userDocument = await Register.findOne({ email: email });

    /*---------------------------------------------------------------------------------------------------------------------------*/

    /* Login in the form when you have normal password and  password stored in database is hash password  */
    /* isMatch returns true or false  */
    const isMatch = await bcrypt.compare(password, userDocument.password);

    /*----------------------------------------------------------------------------------------------------*/
    /*  JWT token generation while login process */
    /* call generateAuthToken user define function in app.js and define in register.js (app.js <=> register.js) */
    const loginToken = await userDocument.generateAuthToken();
    console.log(` the generated token while login process is ${loginToken}`);
    

    /*------------------------------------------------------------------------------------------------------*/
    /*Add secret key or sensitive data in .env file*/

   

    /*------------------------------------------------------------------------------------------------------*/
    /* store token in cookies after submit the login page */
    res.cookie("jwt", loginToken, {
      expires: new Date(Date.now() + 900000),
      httpOnly: true,
      secure: true,
    });
    /*------------------------------------------------------------------------------------------------------*/

    if (isMatch) {
      const register = await userDocument.save();
      console.log("registered Document with browser token while login is");
      console.log(register);
      res.render("index");
    } else {
      res.send("Invalid password details");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

/*------------------------------------------------------------------------------------------------------------- */
// when click on logout:
// we have two option
//  1. delete only current token from browser and database.
//  2. delete all active token from other devices and database.

//  1. delete token only from current browser and database.
app.get("/logout", auth, async (req, res) => {
  try {
    // we are getting user document from auth.js  using req.user in app.js
    console.log(
      `we are getting user document from auth.js using req.user in app.js ${req.user}`
    );

    // we are getting token value from auth.js in app.js using req.token
    console.log(
      `we are getting token value from auth.js using req.token in app.js ${req.token}`
    );

    console.log(
      ` req.user.tokens is an object which stores tokens, commented from app.js ${req.user.tokens} `
    );

    req.user.tokens = req.user.tokens.filter((currentElement) => {
      console.log(
        `filter method: this currentElement stores element of tokens object in app.js ${currentElement}`
      );
      console.log(
        `filter method:this is currentElement.token getting token value from currentElement  ${currentElement.token}`
      );
      console.log(`filter method Browser token in app.js ${req.token}`);

      return currentElement.token !== req.token;
    });
    /*----------------------------------------------------------------------------------*/
    // option 2. delete all active token from other devices and database.
    // remove or comment filter part

    // req.user.tokens = [];
    /*----------------------------------------------------------------------------------*/

    res.clearCookie("jwt"); 

    console.log("logout successfull");

    await req.user.save();

    res.render("login");
  } catch (error) {
    res.status(500).send(error);
  }
});
/*------------------------------------------------------------------------------------------------------------- */

app.listen(port, () => {
  console.log(`connected with the port no. ${port}`);
});

