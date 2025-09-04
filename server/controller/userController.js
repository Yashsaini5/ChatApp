const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const key = process.env.SECRET_KEY;

const createUser = async (req, res) => {
  const { Name, Email, Password } = req.body;
  if (!Name || !Email || !Password)
    return res.status(400).json({ message: "all fields required" });

  const existingUser = await User.findOne({ email: Email });
  if (existingUser)
    return res.status(400).json({ message: "user already exists" });

  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(Password, salt);

  const createUser = await User.create({
    name: Name,
    email: Email,
    password: encryptedPassword,
  });

  const token = jwt.sign(
    { _id: createUser._id, name: createUser.name, email: createUser.email },
    key,
    { expiresIn: "2d" }
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: true, // REQUIRED in production on HTTPS
    sameSite: "none", // REQUIRED for cross-site cookies
  });
  res.status(200).json({
    _id: createUser._id,
    name: createUser.name,
    email: createUser.email,
    message: "user created successfully",
  });
};

const loginUser = async (req, res) => {
  const { Email, Password } = req.body;
  if (!Email || !Password)
    return res.status(400).json({ message: "all fields required" });

  const existingUser = await User.findOne({ email: Email });
  if (!existingUser)
    return res.status(400).json({ message: "Email or Password is incorrect" });

  const isPasswordMatch = await bcrypt.compare(
    Password,
    existingUser?.password
  );
  if (!isPasswordMatch)
    return res.status(400).json({ message: "Email or Password is incorrect" });

  const token = jwt.sign(
    {
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
    },
    key,
    { expiresIn: "2d" }
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only true in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });
  res.status(200).json({
    _id: existingUser._id,
    name: existingUser.name,
    email: existingUser.email,
    message: "user logged in successfuly",
  });
};

const getUser = async (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
};

const getAllUser = async (req, res) => {
  try {
    const allUsers = await User.find();
    const filteredUser = allUsers.filter(
      (user) => user.email !== req.user.email
    );
    res.status(200).json(filteredUser);
  } catch (error) {
    res.status(400).json({ message: "error accesing users" });
  }
};

module.exports = { createUser, loginUser, getUser, getAllUser };
