const express = require('express')
const router = express.Router()
const {authMiddleware} = require("../middleware/authmiddleware")
const { createUser , loginUser, getUser, getAllUser} = require('../controller/userController')

router.post("/signup",createUser)
router.post("/login",loginUser)
router.get("/getUser",authMiddleware, getUser)
router.get("/getAllUser",authMiddleware, getAllUser)

module.exports = router