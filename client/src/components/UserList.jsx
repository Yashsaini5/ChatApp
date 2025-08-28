import React, { useState, useEffect } from "react";
import ProfilePic from "./ProfilePic";
import { useData } from "../context/DataContext";
const url = import.meta.env.VITE_BACKEND_URL;

const UserList = () => {
  const { user, usersList, setSelectedUser, typingStatus, lastMessages, setLastMessages, lastMessageFunc} = useData() 

  useEffect(() => {
    lastMessageFunc();
  }, []);

  const sortedUsers = [...usersList].sort((a,b) => {
   const convA = lastMessages.find((msg) => msg.userInfo.email === a.email)
   const convB = lastMessages.find((msg) => msg.userInfo.email === b.email)

    const timeA = convA?.lastMessage?.createdAt ? new Date(convA.lastMessage.createdAt).getTime() : 0;
    const timeB = convB?.lastMessage?.createdAt ? new Date(convB.lastMessage.createdAt).getTime() : 0;

    return timeB - timeA
  }) 

  return (
    <div className="flex flex-col">
      {sortedUsers?.map((otherUser) => {
        const conversation = lastMessages.find(
          (msg) => msg.userInfo.email === otherUser.email
        );
        const status = conversation?.lastMessage?.status || conversation?.status

        return (
          <div
            key={otherUser._id}
            className="h-16 bg-zinc-600 text-white border-b-2 border-zinc-500 flex items-center px-3 gap-2 hover:bg-zinc-700"
            onClick={() =>
              setSelectedUser({ name: otherUser.name, email: otherUser.email })
            }
          >
            <ProfilePic user={otherUser.name} />
            <div>
              <p className="font-medium cursor-pointer">{otherUser.name}</p>
              <div className="flex items-center text-sm">
                {(conversation?.lastMessage?.sender?.email === user.email || conversation?.lastMessage?.sender === user._id ) ? (
                    <div className="text-xs text-gray-300 pr-1 text-end">
                      {status === "read" ? (
                        <span className="text-blue-400 tracking-tighter">
                          ✓✓
                        </span>
                      ) : status === "delivered" ? (
                        <span className="tracking-tighter">✓✓</span>
                      ) : status === "sent" ? (
                        "✓"
                      ) : ""}
                    </div>
                  ) : (
                    <></>
                  )}
                <p className="font-light pl-1 text-gray-100 w-48 whitespace-nowrap overflow-hidden cursor-pointer">
                  {typingStatus[otherUser.email] ? "Typing..." :
                  conversation
                    ? conversation.lastMessage?.content.length > 28
                      ? conversation.lastMessage?.content.slice(0, 28) + "..."
                      : conversation.lastMessage?.content
                    : "No messages yet"}
                </p>
                {conversation?.unreadCount > 0 && ( 
                  <span className="h-4 w-4 rounded-full ml-2 bg-green-600 text-xs text-black font-medium flex justify-center items-center z-10">{conversation?.unreadCount}</span> 
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
