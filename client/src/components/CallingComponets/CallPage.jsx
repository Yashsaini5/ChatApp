import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from "react-icons/fa";
import useWebRTC from "../../hooks/useWebRTC";
import { useData } from "../../context/DataContext";

const CallPage = ({  mode, socket, localStream, remoteStream, hangUp, toggleMute, toggleCamera, isMuted, camOff }) => {
  if (!socket) {
    return (
      <p className="text-white">
        ⚠️ Socket connection not found. Go back to chat and start again.
      </p>
    );
  }

  const [seconds, setSeconds] = useState(0);
  const { user, selectedUser} = useData();
  const name = user?.name || "Unknown";

  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
 const { myCamOff, remoteCamOff } = useData() 

  useEffect(() => {
    if (myVideoRef.current && localStream)
      myVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream)
      remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
  const interval = setInterval(() => {
    setSeconds((prev) => prev + 1);
  }, 1000);

  return () => clearInterval(interval);
}, []);

  const formatTime = (t) =>
    `${Math.floor(t / 60).toString().padStart(2, "0")}:${(t % 60)
      .toString()
      .padStart(2, "0")}`;


  return (
 <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white z-[999] overflow-hidden">
  {/* Outer container */}
  <div className="w-full h-screen lg:w-[60%] lg:h-[75vh]  md:w-[70%] md:h-[65vh] flex flex-col items-center justify-center relative rounded-none lg:rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
    
    {/* Header */}
    <div className="absolute top-5 text-center">
      <h2 className="text-xl font-semibold mb-1">
        In Call with <span className="text-red-400">{selectedUser?.name}</span>
      </h2>
      <p className="text-gray-400 text-sm">Duration: {formatTime(seconds)}</p>
    </div>

    {/* Main Layout */}
    {mode === "video" ? (
     <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden rounded-2xl">
    {/* --- Remote Video + Avatar --- */}
    <div className="relative w-full h-full flex items-center justify-center bg-gray-900 rounded-2xl overflow-hidden">
      {/* Remote video (kept mounted always) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          remoteCamOff ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Remote avatar overlay when cam off */}
      {remoteCamOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20">
          <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-5xl shadow-inner border-2 border-red-600">
            {selectedUser?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <p className="text-lg font-semibold mt-4 text-white">
            {selectedUser?.name}
          </p>
        </div>
      )}
    </div>

  {/* --- Local (Your) video + Avatar --- */}
    <div className="absolute bottom-6 right-6 w-32 sm:w-40 md:w-56 border border-gray-700 rounded-lg overflow-hidden shadow-xl bg-gray-900 flex items-center justify-center">
      {/* Keep video mounted */}
      <video
        ref={myVideoRef}
        autoPlay
        muted
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          myCamOff ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Avatar when your cam is off */}
      {myCamOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-center z-10">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl shadow-inner border border-gray-600">
            You
          </div>
        </div>
      )}

      <span className="absolute bottom-1 left-1 bg-black/70 text-xs px-2 py-0.5 rounded-md">
        You
      </span>
    </div>
      </div>
    ) : (
      // Audio mode layout
      <div className="flex flex-col items-center justify-center gap-4 bg-gray-800/80 rounded-3xl p-10 shadow-2xl backdrop-blur-sm">
        <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-5xl shadow-inner border-2 border-red-600">
          🎧
        </div>
        <p className="text-xl font-semibold">{selectedUser?.name}</p>
        <p className="text-sm text-gray-400">Voice Call • {formatTime(seconds)}</p>
        <audio ref={remoteVideoRef} autoPlay playsInline />
      </div>
    )}

    {/* Control Bar */}
    <div className="absolute bottom-6 flex items-center justify-center gap-5 bg-gray-800/70 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border border-gray-700">
      {/* Mute */}
      <button
        onClick={toggleMute}
        className={`p-3 rounded-full transition-all transform hover:scale-110 ${
          isMuted ? "bg-yellow-600 hover:bg-yellow-700" : "bg-gray-700 hover:bg-gray-600"
        }`}
      >
        {isMuted ? <FaMicrophoneSlash size={22} /> : <FaMicrophone size={22} />}
      </button>

      {/* Toggle Camera */}
      {mode === "video" && (
        <button
          onClick={() => toggleCamera(myVideoRef)}
          className={`p-3 rounded-full transition-all transform hover:scale-110 ${
            myCamOff ? "bg-yellow-600 hover:bg-yellow-700" : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          {myCamOff ? <FaVideoSlash size={22} /> : <FaVideo size={22} />}
        </button>
      )}

      {/* Hang Up */}
      <button
        onClick={() => {
          hangUp(true);
        }}
        className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-all transform hover:scale-110 shadow-md"
      >
        <FaPhoneSlash size={22} />
      </button>
    </div>
  </div>
</div>
  );
};

export default CallPage;
