import React from "react";
import ProfilePic from "./ProfilePic";
import { useData } from "../context/DataContext";

const ChatHeader = ({ connectedUsers, isMobile }) => {
  const { selectedUser, setSelectedUser, typingStatus } = useData();
  return (
    <div className="h-16 bg-zinc-800 text-xl font-semibold flex items-center text-white gap-3">
       {isMobile ? (
          <button
            onClick={() =>
              setSelectedUser({
                name: "",
                email: "",
              })
            }
            className="h-full text-xs font-extrabold bg-zinc-900 text-white px-3 py-2 flex items-center gap-2"
          >
            ⮜
          </button>
        ) : (
          <></>
        )}
        <span className={`${isMobile? "": "pl-4"}`}>
      <ProfilePic user={selectedUser.name} size="small" />
      </span>
      <div>
        <p>{selectedUser.name}</p>
        {typingStatus[selectedUser.email] ? (
          <p className="text-sm text-gray-400">typing...</p>
        ) : connectedUsers.includes(selectedUser.email) ? (
          <p className="text-sm text-gray-400">Online</p>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
