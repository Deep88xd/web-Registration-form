const jwt = require("jsonwebtoken");
const RegisteredMember = require("../models/registers");

// Getting user Document data  with the help of browser token.
const auth = async (req, res, next) => {
  try {
    //get token from the browser
    const token = req.cookies.jwt;
    // jwt verify token with secret key.
    // verify method return document id
    const verifyUser = await jwt.verify(token, process.env.SECRET_KEY);
    // verifyUser stored document id information,
    console.log(` document id and time stored in verifyUser `);
    console.log(verifyUser);
    console.log(`finding document with the help of id.`);
    const user = await RegisteredMember.findOne({ _id: verifyUser });
    console.log(user);
    console.log(`the generated token in the document is ${user.tokens}`);
    // token and req.token are same
    // we can not get token value & user document directly in app.js from auth.js
    //  req.token &  req.user value is used  in logout functionality.
    req.token = token;
    req.user = user;
    console.log(` this is the token from auth.js ${token}`);
    console.log(` this is req.token from auth.js ${req.token}`);
    next();
  } catch (error) {
    res.status(401).render("home");
  }
};
module.exports = auth;
