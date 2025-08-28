import { useState, useEffect, useRef } from "react";
import { useData } from "../context/DataContext";
import ProfilePic from "./ProfilePic";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
const url = import.meta.env.VITE_BACKEND_URL;

const ChatBox = ({ socket, connectedUsers, isMobile,  allMessages, setAllMessages }) => {
  const { user, selectedUser, setLastMessages } = useData();
  const [isNewMessage, setIsNewMessage] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = ({ messageId, status }) => {
      setAllMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, status } : m))
      );
      setLastMessages((prev) =>
        prev.map((conv) =>
          conv?.lastMessage?._id === messageId
            ? { ...conv, lastMessage: { ...conv.lastMessage, status } }
            : conv
        )
      );
    };

    const handleMessageRead = ({ senderEmail, receiverEmail }) => {
      setAllMessages((prev) =>
        prev.map((msg) =>
          msg.sender.email === senderEmail &&
          msg.receiver.email === receiverEmail &&
          msg.status !== "read"
            ? { ...msg, status: "read" }
            : msg
        )
      );
      setLastMessages((prev) =>
        prev.map((conv) =>
          conv?.lastMessage?.sender?.email === senderEmail &&
          conv?.lastMessage?.receiver?.email === receiverEmail
            ? {
                ...conv,
                lastMessage: { ...conv.lastMessage, status: "read" },
                unreadCount: 0,
              }
            : conv
        )
      );
    };

    socket.on("message_status_update", handleStatusUpdate);
    socket.on("message_read", handleMessageRead);

    return () => {
      socket.off("message_status_update", handleStatusUpdate);
      socket.off("message_read", handleMessageRead);
    };
  }, [socket, selectedUser, user]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ChatHeader connectedUsers={connectedUsers} isMobile={isMobile}/>
      <MessageList allMessages={allMessages} setAllMessages={setAllMessages} socket={socket} isNewMessage={isNewMessage} setIsNewMessage={setIsNewMessage}/>
      <ChatInput socket={socket} setIsNewMessage={setIsNewMessage}/>
    </div>
  );
};

export default ChatBox;
