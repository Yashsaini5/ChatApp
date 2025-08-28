 const mongoose = require('mongoose')
 
 const connectDB = async () => {
 
    try {
       await mongoose.connect("mongodb://127.0.0.1:27017/chatApp")
       console.log("connected to db");
       
    } catch (error) {
        console.log("error connecting to db", error)
    }
 }

 module.exports = connectDB