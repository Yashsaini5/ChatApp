const RingingScreen = ({ isRinging, callData, connectedUsers, selectedUser, socket, setIsRinging, setCallData }) => {
    if (!isRinging || !callData) return null;

    const handleCancel = () => {
        socket.emit("cancel-call", { to: callData.remoteUserId });
        setIsRinging(false);
        setCallData(null);
    }

    const isUserOnline = connectedUsers.includes(selectedUser?.email);

    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
  <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 w-[90%] max-w-sm text-center text-white border border-gray-700">
    
    {/* User Avatar or Placeholder */}
    <div className="relative flex justify-center mb-4">
      <div className="relative w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold border-2 border-gray-600">
        {selectedUser?.name?.charAt(0).toUpperCase() || "?"}
      </div>
    </div>

    {/* Call Info */}
    <h2 className="text-2xl font-semibold mb-1">
      Calling {selectedUser?.name || "Unknown"}
    </h2>
    <p className="text-gray-400 text-sm tracking-wide mb-4">
      {isUserOnline ? "Ringing..." : "User Offline"}
    </p>

    {/* Animated Waves */}
    <div className="flex justify-center items-center mb-6">
      <div className="relative">
        <div className="absolute inset-0 rounded-full border-2 border-red-600 animate-ping"></div>
        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-xl shadow-lg">
          📞
        </div>
      </div>
    </div>

    {/* Cancel Button */}
    <button
      onClick={handleCancel}
      className="px-8 py-2.5 bg-red-600 hover:bg-red-700 rounded-full font-medium text-lg shadow-lg transition-all transform hover:scale-105"
    >
      Cancel Call
    </button>

  </div>
</div>

    )
}

export default RingingScreen;