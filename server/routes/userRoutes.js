const express = require('express')
const router = express.Router()
const {authMiddleware} = require("../middleware/authMiddleware")
const { createUser , loginUser, logoutUser, getUser, getAllUser} = require('../controller/userController')

router.post("/signup",createUser)
router.post("/login",loginUser)
router.post("/logout",authMiddleware, logoutUser)
router.get("/getUser",authMiddleware, getUser)
router.get("/getAllUser",authMiddleware, getAllUser)

module.exports = router