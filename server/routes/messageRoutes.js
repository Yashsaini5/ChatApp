const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getChatMessage,
  lastConversations,
  markMessagesAsRead,
} = require("../controller/messageController");

router.get("/chat", authMiddleware, getChatMessage);
router.get("/lastConversations", authMiddleware, lastConversations);
router.post("/markAsRead", authMiddleware, markMessagesAsRead);

module.exports = router;
