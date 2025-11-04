import React from "react";

export default function IncomingCallModal({ callerName, mode, onAccept, onReject }) {
  return (
   <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
  <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-3xl shadow-2xl p-6 w-[320px] sm:w-[380px] text-center border border-gray-700">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-3xl font-bold shadow-md animate-pulse">
        📞
      </div>

      <h2 className="text-2xl font-semibold tracking-wide">
        Incoming {mode} Call
      </h2>

      <p className="text-gray-300 text-lg">
        <span className="font-medium text-white">{callerName}</span> is calling you...
      </p>

      <div className="flex justify-center gap-6 mt-2">
        <button
          onClick={onAccept}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M5 13l4 4L19 7" />
          </svg>
          Accept
        </button>

        <button
          onClick={onReject}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
          Reject
        </button>
      </div>
    </div>
  </div>
</div>

  );
}