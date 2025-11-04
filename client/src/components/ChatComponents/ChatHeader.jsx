import React from "react";
import { FaPhoneAlt, FaVideo, FaArrowLeft } from "react-icons/fa";
import ProfilePic from "../UsersComponets/ProfilePic";
import { useData } from "../../context/DataContext";
import { useNavigate } from "react-router-dom";

const ChatHeader = ({ connectedUsers, isMobile, startCall }) => {
  const { selectedUser, setSelectedUser, typingStatus } = useData();
  const navigate = useNavigate();

  const handleCall = (mode) => {
    if (!selectedUser?._id) return;
    startCall(selectedUser._id, mode, selectedUser.name);
  };

  return (
    <div className="h-16 bg-gray-800 flex justify-between items-center text-white px-4 gap-3 shadow-md">
      {/* Left Side - User Info */}
      <div className="flex items-center gap-4 ">
        {isMobile && (
          <button
            onClick={() => {
              setSelectedUser({ name: "", email: "" });
              navigate("/");
            }}
            className="h-16 pr-4 pl-3 -ml-5 flex items-center gap-2 bg-gray-700 rounded-lg text-white font-bold hover:bg-gray-700 transition-colors"
          >
            {" "}
            ⮜{" "}
          </button>
        )}
        <ProfilePic user={selectedUser.name} size="small" />
        <div className="flex flex-col">
          <p className="font-semibold text-lg truncate">{selectedUser.name}</p>
          {typingStatus[selectedUser.email] ? (
            <p className="text-sm text-green-400 italic">typing...</p>
          ) : connectedUsers.includes(selectedUser.email) ? (
            <p className="text-sm text-green-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{" "}
              Online
            </p>
          ) : (
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-500"></span> Offline
            </p>
          )}
        </div>
      </div>

      {/* Right Side - Call Buttons */}
      {selectedUser?._id && (
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Audio Call */}
          <button
            onClick={() => handleCall("audio")}
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-md hover:shadow-blue-500/30"
            title="Voice Call"
          >
            <FaPhoneAlt size={18} />
          </button>

          {/* Video Call */}
          <button
            onClick={() => handleCall("video")}
            className="p-3 rounded-full bg-green-600 hover:bg-green-500 active:scale-95 transition-all shadow-md hover:shadow-green-500/30"
            title="Video Call"
          >
            <FaVideo size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
