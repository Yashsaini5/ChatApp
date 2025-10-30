import React, { useEffect } from "react";
import ProfilePic from "./ProfilePic";
import { useData } from "../../context/DataContext";
const url = import.meta.env.VITE_BACKEND_URL;

const UserList = () => {
  const {
    user,
    usersList,
    setSelectedUser,
    typingStatus,
    lastMessages,
    setLastMessages,
    lastMessageFunc,
  } = useData();

  useEffect(() => {
    lastMessageFunc();
  }, []);

  const sortedUsers = [...usersList].sort((a, b) => {
    const convA = lastMessages.find((msg) => msg.userInfo.email === a.email);
    const convB = lastMessages.find((msg) => msg.userInfo.email === b.email);

    const timeA = convA?.lastMessage?.createdAt
      ? new Date(convA.lastMessage.createdAt).getTime()
      : 0;
    const timeB = convB?.lastMessage?.createdAt
      ? new Date(convB.lastMessage.createdAt).getTime()
      : 0;

    return timeB - timeA;
  });

  return (
    <div className="flex flex-col">
  {sortedUsers?.map((otherUser) => {
    const conversation = lastMessages.find(
      (msg) => msg.userInfo.email === otherUser.email
    );
    const status =
      conversation?.lastMessage?.status || conversation?.status;

    return (
      <div
        key={otherUser._id}
        className="h-16 flex items-center px-4 gap-3 border-b border-gray-700 bg-gray-700 text-white hover:bg-gray-600 cursor-pointer transition-colors"
        onClick={() =>
          setSelectedUser({ name: otherUser.name, email: otherUser.email })
        }
      >
        <ProfilePic user={otherUser.name} />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{otherUser.name}</p>
          <div className="flex items-center text-sm mt-1 min-w-0">
            {(conversation?.lastMessage?.sender?.email === user.email ||
              conversation?.lastMessage?.sender === user._id) && (
              <div className="text-xs text-gray-400 pr-1 flex-shrink-0">
                {status === "read" ? (
                  <span className="text-blue-400 tracking-tighter">✓✓</span>
                ) : status === "delivered" ? (
                  <span className="tracking-tighter">✓✓</span>
                ) : status === "sent" ? (
                  "✓"
                ) : (
                  ""
                )}
              </div>
            )}
            <p className="font-light pl-1 text-gray-200 truncate flex-1">
              {typingStatus[otherUser.email]
                ? "Typing..."
                : conversation
                ? conversation.lastMessage?.content
                : "No messages yet"}
            </p>
            {conversation?.unreadCount > 0 && (
              <span className="ml-2 flex-shrink-0 h-5 w-5 rounded-full bg-green-500 text-xs text-black font-medium flex justify-center items-center">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  })}
</div>

  );
};

export default UserList;
