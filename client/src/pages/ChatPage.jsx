import React, { useEffect, useState, useRef } from "react";
import ChatBox from "../components/ChatBox";
import io from "socket.io-client";
import { useData } from "../context/DataContext";

const ChatPage = ({isMobile}) => {
  const {
    user,
    selectedUser,
    setLastMessages,
    setTypingStatus,
    lastMessageFunc
  } = useData();
  const socketRef = useRef(null);
  const selectedUserRef = useRef(selectedUser)
  const [isConnected, setIsConnnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [allMessages, setAllMessages] = useState([]);

  useEffect(() => {
    selectedUserRef.current = selectedUser
  }, [selectedUser])

  useEffect(() => {
    if (!user?.email) return;

    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
    });

    if (user?.email && socketRef.current) {
      socketRef.current.emit("register_user", user.email);

      socketRef.current.on("online_users", (users) =>
        setConnectedUsers(Object.keys(users))
      );

      socketRef.current.on("connect", () => setIsConnnected(true));
      socketRef.current.on("disconnect", () => setIsConnnected(false));

      socketRef.current.on("receive_message", (msg) => {
        const message = msg.populatedMessage;

        if (
          (message.sender.email === selectedUserRef.current.email &&
            message.receiver.email === user.email) ||
          (message.sender.email === user.email &&
            message.receiver.email === selectedUserRef.current.email)
        ) {
          setAllMessages((prev) => [...prev, message]);

          if (message.sender.email === selectedUserRef.current.email) {
            socketRef.current.emit("mark_as_read", { messageId: message._id });
          }
        }

        setLastMessages((prev) => {
          const otherUser =
            message.sender.email === user.email
              ? message.receiver
              : message.sender;

          return [
            { userInfo: otherUser, lastMessage: message },
            ...prev.filter((conv) => conv.userInfo.email !== otherUser.email),
          ];
        });
        lastMessageFunc()
      });

      const handleTypingStatus = ({ from, to }) => {
        if (to === user.email) {
          setTypingStatus((prev) => ({ ...prev, [from]: true }));
        }
      };

      const handleStopTyping = ({ from, to }) => {
        if (to === user.email) {
          setTypingStatus((prev) => ({
            ...prev,
            [from]: false,
          }));
        }
      };

      socketRef.current.on("typing", handleTypingStatus);
      socketRef.current.on("stop_typing", handleStopTyping);
    }
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div className="bg-zinc-400 h-full w-full overflow-hidden">
      {selectedUser.name ? (
        <ChatBox socket={socketRef.current} connectedUsers={connectedUsers} isMobile={isMobile} allMessages={allMessages} setAllMessages={setAllMessages}/>
      ) : (
        <div className="h-full w-full flex flex-col justify-center items-center text-zinc-900 ">
          <p className="text-4xl font-bold">Chat App</p>
          <p className="text-2xl font-medium">
            Click any user to start chating...
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
