const Message = require("../models/messageModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

const getChatMessage = async (req, res) => {
  const { receiver, before , limit = 30} = req.query;
  const sender = req.user.email;

  try {
    const senderUser = await User.findOne({ email: sender });
    const receiverUser = await User.findOne({ email: receiver });

    if (!senderUser || !receiverUser) {
      return res.status(404).json({ error: "User(s) not found" });
    }

    const messages = await Message.find({
      $or: [
        { sender: senderUser._id, receiver: receiverUser._id },
        { sender: receiverUser._id, receiver: senderUser._id },
      ],
      ...(before && {createdAt: {$lt : new Date(before)}})
    }).sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate("sender", "name email")
    .populate("receiver", "name email")

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "error fetching messages" });
  }
};

const lastConversations = async (req, res) => {

  try {
  const myUserId = new mongoose.Types.ObjectId(req.user._id);

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            {sender: myUserId}, 
            {receiver: myUserId}
          ]
        }
      },
      {$sort: {createdAt : -1 }},
      {
        $group : {
          _id : {
            $cond: [
              {$eq: ["$sender", myUserId]},
              "$receiver",
              "$sender"
            ]
          },
        lastMessage : {$first: "$$ROOT"},
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$receiver", myUserId]},
                  { $ne: ["$status", "read"]}
                ]
              },
              1,
              0
            ]
          }
        }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $addFields: {
          status: {
            $cond: [
              { $eq : ["$lastMessage.sender", myUserId]},
              "$lastMessage.status",
              null
            ]
          }
        }
      },
      { $sort: { "lastMessage.createdAt": -1 } }
    ])

    // // ✅ Populate sender & receiver inside lastMessage
    // conversations = await Message.populate(conversations, {
    //   path: "lastMessage.sender lastMessage.receiver",
    //   select: "email name _id",
    // });

    res.json(conversations)
  } catch (error) {
    console.log("error in controller", error)
  }
}

const markMessagesAsRead = async (req,res) => {

  const { senderEmail } = req.body;
  const receiverEmail = req.user.email;

  try {
    const sender = await User.findOne({email: senderEmail})
  const receiver = await User.findOne({email: receiverEmail})

  await Message.updateMany({
    sender: sender._id,
    receiver: receiver._id,
    status:{
      $ne: "read"
    }
  },{
      $set: {
        status: "read"
    }
  })

  res.json({success: true})
  } catch (error) {
    console.log("error updating to read", error)
  }
  
}

module.exports = { getChatMessage, lastConversations, markMessagesAsRead };
