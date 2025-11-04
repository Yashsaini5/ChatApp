import { use, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import io from "socket.io-client";
import { useData } from "../context/DataContext";

// const SIGNALING_SERVER_URL = "http://localhost:5000"; // Replace with your signaling server URL

export default function useWebRTC({ user, remoteUserId, mode, socket }) {
  // if (!socket) {
  //   console.error(
  //     "Socket is undefined — WebRTC cannot work without signaling!"
  //   );
  //   return {};
  // }

  const userId = user?._id;
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const {
    incomingCall,
    setIncomingCall,
    setCallData,
    setIsRinging,
    setMyCamOff,
    setRemoteCamOff,
  } = useData();

  useEffect(() => {
    if (!socket) return;
    // if (!remoteUserId) return;
    socket.on("incoming-call", ({ from, offer, name, mode }) => {
      setIncomingCall({ from, offer, name, mode });
      setIsRinging(true);
    });

    // when answer comes from remote user
    socket.on("call-accepted", async ({ answer }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(answer);
    });

    socket.on("call-rejected", handleCallRejected);

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await pcRef.current?.addIceCandidate(candidate);
      } catch (error) {
        console.error("Error adding received ice candidate", error);
      }
    });

    // Listen for peer's camera toggle
    socket.on("camera-toggled", ({ camOff }) => {
      setRemoteCamOff(camOff);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("call-rejected", handleCallRejected);
      socket.off("ice-candidate");
      socket.off("camera-toggled");
      closeConnection();
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleHangUp = () => {
      // Call hangUp but skip emitting again (to prevent loop)
      hangUp(false);
    };

    socket.on("hang-up", handleHangUp);

    return () => socket.off("hang-up", handleHangUp);
  }, [socket]);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    const { from, offer, mode } = incomingCall;

    await getLocalMedia(mode);
    await ensurePeerConnection(from, mode);
    await pcRef.current.setRemoteDescription(offer);

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socket.emit("accept-call", { to: from, answer });
    setCallData({
      remoteUserId: from,
      mode,
      socket,
      offer,
      userId: user._id,
    });
    setIncomingCall(null);
    setIsRinging(false);
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;
    socket.emit("reject-call", { to: incomingCall.from });
    setIncomingCall(null);
    setIsRinging(false);
  };

  const handleCallRejected = () => {
    console.log("Call rejected by user");

    // 1️⃣ Stop local camera/mic if active
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // 2️⃣ Close peer connection if started
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // 3️⃣ Reset states/UI
    setIsRinging(false);
    setIncomingCall(null);
    setRemoteStream(null);

    toast.error("Call rejected by user");
  };

  const ensurePeerConnection = async (peerId) => {
    if (pcRef.current) return;

    pcRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // You can add TURN servers here if needed
      ],
    });

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: peerId,
          candidate: event.candidate,
        });
      }
    };

    pcRef.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) =>
          pcRef.current.addTrack(track, localStreamRef.current)
        );
    }
  };

  async function getLocalMedia(requestedMode = mode) {
    const constraints =
      requestedMode === "audio"
        ? { audio: true, video: false }
        : { audio: true, video: { width: 1280, height: 720 } };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);

      if (pcRef.current) {
        stream
          .getTracks()
          .forEach((track) => pcRef.current.addTrack(track, stream));
      }
      return stream;
    } catch (error) {
      console.error("Error accessing media devices.", error);

      // Handle common permissions errors
      if (error.name === "NotAllowedError") {
        const retry = window.confirm(
          "Camera or microphone access was blocked.\nPlease allow permissions and click OK to retry."
        );
        if (retry) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia(
              constraints
            );
            localStreamRef.current = stream;
            setLocalStream(stream);

            if (pcRef.current) {
              stream
                .getTracks()
                .forEach((track) => pcRef.current.addTrack(track, stream));
            }
            return stream;
          } catch (innerError) {
            alert(
              "Still unable to access camera/microphone. Please check browser settings (lock icon near address bar)."
            );
            console.error("Retry failed:", innerError);
          }
        }
      } else if (error.name === "NotFoundError") {
        alert("No camera or microphone detected on this device.");
      } else {
        alert(
          "Error accessing media devices. Please check your permissions or hardware."
        );
      }

      // Return null if permission denied or failed
      return null;
    }
  }

  async function callUser(to, name, mode) {
    // ensure local media is captured
    if (!localStreamRef.current) {
      await getLocalMedia(mode);
    }

    await ensurePeerConnection(to);

    // create offer
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    console.log("Calling from:", name);
    socket.emit("call-user", { to, offer, from: userId, name, mode });
  }

  function hangUp() {
    socket.emit("hang-up", { to: remoteUserId, from: userId });

    // 2️⃣ Stop local media
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // 3️⃣ Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // 4️⃣ Reset UI states
    setRemoteStream(null);
    setIncomingCall(null);
    setCallData(null);
    setIsRinging(false);

    // 5️⃣ Notify user
    toast.info("Call ended");
  }

  function closeConnection() {
    pcRef.current?.close();
    pcRef.current = null;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    setRemoteStream(null);
  }

  async function toggleMute() {
    if (!localStreamRef.current) {
      console.warn("No local stream — trying to re-init mic...");
      await getLocalMedia(mode); 
    }
    localStreamRef.current
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setIsMuted((muted) => !muted);
  }

  const toggleCamera = (myVideoRef) => {
  if (!localStream) return;

  const videoTrack = localStream.getVideoTracks()[0];
  if (!videoTrack) return;

  // Toggle camera enabled state
  const newEnabledState = !videoTrack.enabled;
  videoTrack.enabled = newEnabledState;

  const isCamOff = !newEnabledState;
  setMyCamOff(isCamOff);

  // 🔧 Explicitly handle local video visibility & playback
  if (myVideoRef.current) {
    if (!isCamOff) {
      // Reattach stream when turning camera ON
      myVideoRef.current.srcObject = localStream;
      myVideoRef.current
        .play()
        .catch((err) => console.warn("Play error:", err));
    } else {
      // Optionally pause when turning OFF
      myVideoRef.current.pause();
    }
  }

  // 🔁 Notify remote peer
  socket.emit("camera-toggled", {
    to: remoteUserId,
    camOff: isCamOff,
  });
};

  return {
    localStream,
    remoteStream,
    getLocalMedia,
    callUser,
    handleAcceptCall,
    handleRejectCall,
    hangUp,
    toggleMute,
    toggleCamera,
    isMuted,
    // camOff,
  };
}
