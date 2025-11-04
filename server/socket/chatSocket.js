const Message = require('../models/messageModel')
const User = require("../models/userModel")

const users = {};

const markAsDelivered = async (userEmail) => {
  const user = await User.findOne({email: userEmail})
  if(!user) return; 

  const message = await Message.find({
    receiver: user._id,
    status: "sent"
  }).populate("sender", "email");

  await Message.updateMany(
    {receiver: user._id, status: "sent"},
    {$set: {status: "delivered" } }
  );

  message.forEach((msg)=> {
    const senderSocketId = users[msg.sender.email];
    if(senderSocketId){
      io.to(senderSocketId).emit('message_status_update', {
        messageId: msg._id,
        status: "delivered"
      })
    }
  })
}

module.exports = (io, socket) => {

     socket.on("register_user", async (email) => {
      users[email] = socket.id;
      socket.email = email
      // console.log("Updated users map:", users);

      await markAsDelivered(email)

      io.emit("online_users", users)
    });

     socket.on("send_message", async (data) => {
      const { sender, receiver, message } = data;

        const senderUser = await User.findOne({email: sender})
        const receiverUser = await User.findOne({email: receiver})

        if(!senderUser || !receiverUser) return;

       const newMessage = await Message.create({
        sender: senderUser._id,
        receiver: receiverUser._id,
        content: message,
        status: users[receiver] ? "delivered" : "sent"
      });

      const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "email name")
      .populate("receiver", "email name")

      if (users[receiver]) {
        io.to(users[receiver]).emit("receive_message", {
          populatedMessage
        });
      }

     io.to(socket.id).emit("receive_message", {populatedMessage}) 
      // socket.emit("message_sent", {
      //   populatedMessage
      // });
    });

    socket.on('mark_as_read', async ({messageId}) => {
      const updated = await Message.findByIdAndUpdate(messageId, {
        status: "read"
      }, { new: true }).populate("sender", "email")

      if(!updated){
        console.error(`message with ID ${messageId} not found`) 
        return;
      }

      const senderEmail = updated.sender.email

    const senderSocketId = users[senderEmail]

    if(senderSocketId){
      io.to(senderSocketId).emit("message_status_update",{
        messageId: updated._id,
        status: updated.status
      })
    }  
    })

    //
    socket.on("message_read", ({ senderEmail, receiverEmail }) => {
  const senderSocketId = users[senderEmail];

  if (senderSocketId) {
    io.to(senderSocketId).emit("messages_read", {
      senderEmail,
      receiverEmail,
    });
  }
});
//

    socket.on("typing", ({ from, to }) => {
      if (users[to]) {
        io.to(users[to]).emit("typing", {from, to});
      }
    });

    socket.on("stop_typing", ({ from, to }) => {
      if (users[to]) {
        io.to(users[to]).emit("stop_typing", { from, to });
      }
    });

     
    socket.on("disconnect", () => {
      const email = socket.email; 
      if(email && users[email] === socket.id){
        delete users[email];
      }
      io.emit("online_users", users)
      // console.log(`user ${email} with socket ID ${socket.id} disconnected`)
    
    });
}