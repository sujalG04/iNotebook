const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');//npm i bcryptjs ; it is used to hash the password
const jwt = require('jsonwebtoken');//npm i jsonwebtoken ; it is used to return token 
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const JWT_SECRET = "topsecret";
let success = false;
// ROUTE 1: create a user using POST "/api/auth/createuser" ; no login required
router.post('/createuser', [
  body('name', 'enter valid name').isLength({ min: 3 }),
  body('email', 'enter valid email').isEmail(),
  body('password', 'password length should be minimum 5').isLength({ min: 5 })
], async (req, res) => {

  // If there are errors return bad request and error msg
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    success = false;
    return res.status(400).json({success , errors: errors.array() });
  }
  // check whether user with this email exists already 
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      success = false;
      res.status(400).json({success , error: "user with this email exists already" })
    }

    const salt = bcrypt.genSaltSync(10); // creating salt ; additional char for password
    const secPass = await bcrypt.hash(req.body.password, salt); // it generate the hash of password
    // new user create
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass

    });
    // this code generate json web token which return to user authentication token as response of user sign up
    const data = {
      user: {
        id: user.id
      }
    };
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success , authToken });

  } catch (error) {
    success = false;
    console.error({success ,error:error.message});
    res.send({success ,error:"Internal Error Occured !"});
  }

});

// ROUTE 2: login by using POST:"/api/auth/login" ; no login required
router.post('/login', [
  body('email', 'enter valid email').isEmail(),
  body('password', 'password should not be blank').exists()
], async (req, res) => {
  // If there are errors return bad request and error msg
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    success = false;
    return res.status(400).json({ success , errors: errors.array() });
  };
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      success = false;
      res.status(400).json({success , error: "Enter valid credential" });
    }
    const comparePass = await bcrypt.compare(password ,  user.password);
    if (!comparePass) {
      success = false;
      res.status(400).json({ success , error: "Enter valid credential" });
    };

    // this code generate json web token which return to user authentication token as response of user login
    const data = {
      user: {
        id: user.id
      }
    };
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success , authToken });

  } catch (error) {
    success = false;
    console.error({ success , error: error.message });
    res.send({ success , error: "Internal Error Occured !" });
  }
});
// ROUTE 3 : POST "/api/auth/getuser"; getting user details
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    success = true;
    res.send({ success , user });

  } catch (error) {
    success = false;
    console.error({ success , error: error.message });
    res.send({ success , error: "Internal Error Occured !" });
  }
});

module.exports = router