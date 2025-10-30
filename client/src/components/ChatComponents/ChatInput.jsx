import React, {useState, useRef } from "react";
import { useData } from "../../context/DataContext";

const ChatInput = ({ socket, setIsNewMessage }) => {
  const [message, setMessage] = useState([]);
  const typingTimeoutRef = useRef(null);
  const {user, selectedUser} = useData()

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!socket || !selectedUser) return;

    socket.emit("typing", { from: user.email, to: selectedUser.email });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { from: user.email, to: selectedUser.email });
    }, 1000);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message?.trim()) return;

    const newMessage = { message, sender: user.email, receiver: selectedUser.email };
    socket.emit("send_message", newMessage);
    setMessage("");
    setIsNewMessage(true);
  };

  return (
   <div className="h-16 bg-gray-800 flex items-center px-3 shadow-inner">
  <input
    type="text"
    placeholder="Type your message..."
    className="h-[80%] w-5/6 px-4 bg-gray-700 rounded-full shadow-md placeholder:text-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    value={message}
    onChange={handleInputChange}
    onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
  />
  <button
    className="h-[80%] w-1/6 ml-2 bg-blue-600 rounded-full text-white font-semibold text-xl flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
    onClick={sendMessage}
  >
    ➤
  </button>
</div>

  );
};

export default ChatInput;
