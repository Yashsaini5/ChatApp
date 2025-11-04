import { useState, useEffect, useRef, use } from "react";
import { useData } from "../../context/DataContext";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import CallPage from "../CallingComponets/CallPage";
import IncomingCallModal from "../CallingComponets/IncomingCallModel";
import RingingScreen from "../CallingComponets/RingingScreen";
import useWebRTC from "../../hooks/useWebRTC";

const ChatBox = ({ socket, connectedUsers, isMobile,  allMessages, setAllMessages }) => {
  const { user, selectedUser, setLastMessages, incomingCall, setIncomingCall, callData, setCallData, isRinging, setIsRinging} = useData();
  const [isNewMessage, setIsNewMessage] = useState(false);
  const mode = callData?.mode || incomingCall?.mode;
  const {callUser, handleAcceptCall, handleRejectCall, localStream, remoteStream, hangUp, toggleMute, toggleCamera, isMuted, camOff} = useWebRTC({user, remoteUserId: callData?.remoteUserId,  mode, socket})

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

  useEffect(() => {
    if (!socket) return;

    socket.on("call-accepted", ({ from }) => {
      setIsRinging(false);
      setCallData((prev) => ({
        ...prev,
        remoteUserId: from,
      }));
    });

    socket.on("call-rejected", () => {
      setIsRinging(false);
      setIncomingCall(null);
      setCallData(null);
    });

    return () => {
      socket.off("call-accepted");
      socket.off("call-rejected");
    };
  }, [socket]);

  useEffect(() => {
  let audio;

  if (isRinging) {
    audio = new Audio("/ringtone-023-376906.mp3");
    audio.loop = true;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.warn("Autoplay blocked — will play after user interaction", err);
      }
    };

    playAudio();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }
}, [isRinging]);

    const handleStartCall = (remoteUserId, mode) => {
      callUser(remoteUserId, user?.name || "Unknown", mode);
      setIsRinging(true);
      setCallData({ remoteUserId, mode, socket });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ChatHeader connectedUsers={connectedUsers} isMobile={isMobile} startCall={handleStartCall}/>
      {incomingCall && isRinging === true &&
      (
        <IncomingCallModal callerName={incomingCall.name} mode={incomingCall.mode} onAccept={handleAcceptCall} onReject={handleRejectCall} />
      )}

      {isRinging && (<RingingScreen isRinging={isRinging} callData={callData} connectedUsers={connectedUsers} selectedUser={selectedUser} socket={socket} setIsRinging={setIsRinging} setCallData={setCallData} />)}
      
      {callData && isRinging === false
                && (  
                  <div className="absolute inset-0 z-20">
                      <CallPage mode={callData.mode || incomingCall.mode} socket={callData.socket} localStream={localStream} remoteStream={remoteStream} hangUp={hangUp} toggleMute={toggleMute} toggleCamera={toggleCamera} isMuted={isMuted} camOff={camOff}/>
                  </div>
                )}
      <MessageList allMessages={allMessages} setAllMessages={setAllMessages} socket={socket} isNewMessage={isNewMessage} setIsNewMessage={setIsNewMessage}/>
      <ChatInput socket={socket} setIsNewMessage={setIsNewMessage}/>
    </div>
  );
};

export default ChatBox;
