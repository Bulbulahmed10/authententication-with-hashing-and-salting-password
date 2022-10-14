//! hashing + salting password

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

//! bcrypt password manager
const bcrypt = require("bcrypt");
const saltRounds = 10;

const User = require("./models/user.model");
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//! mongodb connection
const dbURL = process.env.MONGO_URL;
mongoose
  .connect(dbURL)
  .then(() => {
    console.log(`MOngodb atlas is connected`);
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });

//! register
app.post("/register", async (req, res) => {
  try {
    bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
      const newUser = new User({
        email: req.body.email,
        password: hash,
      });
      await newUser.save();
      res.status(201).json(newUser);
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

//! login
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (user) {
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          res.status(200).json({ message: "valid user" });
        } else {
          res.status(404).json({ message: "user not found" });
        }
      });
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//! home route  -- GET
app.get("/", (req, res) => {
  res.statusCode = 200;
  res.sendFile(__dirname + "/views/index.html");
});

//! error route

app.use((req, res) => {
  res.status(404).json({ message: "bad url route not found" });
});

//! server error

app.use((err, req, res, next) => {
  res.status(500).json({ message: "something broke" });
});

module.exports = app;
