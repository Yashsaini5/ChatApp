import React, { useEffect, useState, useRef } from "react";
import ProfilePic from "./ProfilePic";
import { useData } from "../context/DataContext";
const url = import.meta.env.VITE_BACKEND_URL;

const MessageList = ({
  allMessages,
  setAllMessages,
  socket,
  isNewMessage,
  setIsNewMessage,
}) => {
  const { user, selectedUser, setLastMessages } = useData();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const messageEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  //fetching message
  useEffect(() => {
    if (!user || !selectedUser) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          url + `/message/chat?receiver=${selectedUser.email}&limit=30`,
          { credentials: "include" }
        )
          .then((res) => res.json())
          .then((data) => {
            setAllMessages(data?.reverse());
            setPage(1);
            setHasMore(data.length === 30);
          });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [user, selectedUser]);

  //msg read on chat open
  useEffect(() => {
    if (!selectedUser) return;

    const markAsRead = async () => {
      try {
        const res = await fetch(url + "/message/markAsRead", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderEmail: selectedUser.email,
          }),
        });
        const result = await res.json();

        if (result.success) {
          setAllMessages((prev) =>
            prev.map((msg) =>
              // msg.sender.email === selectedUser.email &&
              // msg.receiver.email === user.email && msg.status !== "read"
              //   ? { ...msg, status: "read" }
              //   : msg
              msg.sender.email === selectedUser.email
                ? { ...msg, status: "read" }
                : msg
            )
          );

          setLastMessages((prev) =>
            prev.map((conv) =>
              conv?.userInfo?.email === selectedUser.email
                ? {
                    ...conv,
                    lastMessage: {
                      ...conv.lastMessage,
                      status: "read",
                    },
                    unreadCount: 0,
                  }
                : conv
            )
          );

          if (socket) {
            socket.emit("message_read", {
              senderEmail: selectedUser.email,
              receiverEmail: user.email,
            });
          }
        }
      } catch (error) {
        console.error("Failed to mark messages as read", error);
      }
    };

    markAsRead();
  }, [selectedUser]);

  useEffect(() => {
    setIsNewMessage(true);
  }, [selectedUser]);

  //intial and newMessage scroll
 useEffect(() => {
  if (!isNewMessage || !allMessages.length) return;

  const container = messageContainerRef.current;
  if (!container) return;

  // Scroll to the absolute bottom
  container.scrollTop = container.scrollHeight;
  // setIsNewMessage(false);
}, [allMessages, isNewMessage]);

  //scroll for Older messages
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
        setIsNewMessage(false);
      if (container.scrollTop === 0 && hasMore) loadOlderMessages();
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [allMessages, hasMore]);

  const messagesForSelectedUser = allMessages.filter(
    (msg) =>
      (msg.sender.email === selectedUser.email &&
        msg.receiver.email === user.email) ||
      (msg.sender.email === user.email &&
        msg.receiver.email === selectedUser.email)
  );

  const loadOlderMessages = async () => {
    if (!allMessages.length) return;

    const container = messageContainerRef.current;
    const prevScrollHeight = container.scrollHeight;
    const oldestMessageTime = allMessages[0]?.createdAt;

    try {
      const res = await fetch(
        `${url}/message/chat?receiver=${selectedUser.email}&before=${oldestMessageTime}&limit=30`,
        { credentials: "include" }
      );
      const data = await res.json();

      setAllMessages((prev) => {
        const merge = [...data, ...prev];
        const unique = merge.filter(
          (msg, index, self) =>
            index === self.findIndex((m) => m._id === msg._id)
        );
        return unique.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
      setPage((prev) => prev + 1);
      setHasMore(data.length === 30);

      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight - prevScrollHeight;
      });
    } catch (error) {
      console.error("Error loading older messages:", error);
    }
  };

  const groupMessagesByDay = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let label;
      if (date.toDateString() === today.toDateString()) label = "Today";
      else if (date.toDateString() === yesterday.toDateString())
        label = "Yesterday";
      else label = date.toLocaleDateString();

      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDay(messagesForSelectedUser);

  return (
    <div
  className="h-[72.3vh] bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 overflow-y-auto px-3 py-3 flex flex-col space-y-2"
  ref={messageContainerRef}
>
  {Object.keys(groupedMessages).map((day) => (
    <div key={day}>
      <div className="flex justify-center">
        <div className="text-center py-1 px-3 mt-3 rounded-2xl bg-gray-700 text-white text-sm shadow-sm">
          {day}
        </div>
      </div>

      {groupedMessages[day].map((msg, i) => {
        const isSender = user.email === msg.sender.email;
        return (
          <div
            key={i}
            className={`flex flex-col ${isSender ? "items-end" : "items-start"}`}
          >
            <div className={`flex items-end w-full ${isSender ? "flex-row-reverse pr-6" : "flex-row"}`}>
              <div className="pl-2">
                <ProfilePic user={msg.sender.name} size="small" />
              </div>
              <div
                className={`${
                  isSender ? "bg-green-700" : "bg-gray-700"
                } mx-3 mt-2 min-h-[2.5rem] max-w-[60%] rounded-2xl break-words shadow-md`}
              >
                <div className="flex flex-col">
                  <span className="text-base font-normal px-4 py-2 break-words text-white">
                    {msg.content}
                  </span>
                  {isSender && (
                    <div className="flex justify-end px-3 pb-1">
                      <span className="text-xs text-gray-300 flex items-center gap-1">
                        {msg.status === "read" ? (
                          <span className="text-blue-400 tracking-tighter">✓✓</span>
                        ) : msg.status === "delivered" ? (
                          "✓✓"
                        ) : (
                          "✓"
                        )}
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ))}
  <div ref={messageEndRef} />
</div>

  );
};

export default MessageList;
