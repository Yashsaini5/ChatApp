import React from "react";
import ProfilePic from "./ProfilePic";
import { useData } from "../context/DataContext";

const ChatHeader = ({ connectedUsers, isMobile }) => {
  const { selectedUser, setSelectedUser, typingStatus } = useData();
  return (
   <div className="h-16 bg-gray-800 flex items-center text-white px-4 gap-3 shadow-md">
  {isMobile && (
    <button
      onClick={() =>
        setSelectedUser({
          name: "",
          email: "",
        })
      }
      className="h-10 px-3 py-1 flex items-center gap-2 bg-gray-800 rounded-lg text-white font-bold hover:bg-gray-700 transition-colors"
    >
      ⮜ Back
    </button>
  )}
  <ProfilePic user={selectedUser.name} size="small" />
  <div className="flex flex-col">
    <p className="font-semibold text-lg truncate">{selectedUser.name}</p>
    {typingStatus[selectedUser.email] ? (
      <p className="text-sm text-green-400 italic">typing...</p>
    ) : connectedUsers.includes(selectedUser.email) ? (
      <p className="text-sm text-green-500 font-medium">Online</p>
    ) : (
      <p className="text-sm text-gray-400">Offline</p>
    )}
  </div>
</div>

  );
};

export default ChatHeader;
