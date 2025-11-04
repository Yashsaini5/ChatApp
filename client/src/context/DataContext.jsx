import { createContext, useState, useEffect, useContext } from "react";
const url = import.meta.env.VITE_BACKEND_URL;

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState({
    name: "",
    email: "",
  });
  const [typingStatus, setTypingStatus] = useState({});
  const [lastMessages, setLastMessages] = useState([]);
  const [callData, setCallData] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isRinging, setIsRinging] = useState(false);
  const [myCamOff, setMyCamOff] = useState(false)
  const [remoteCamOff, setRemoteCamOff] = useState(false)
 
  const lastMessageFunc = async () => {
    try {
      const res = await fetch(url + "/message/lastConversations", {
        credentials: "include",
      });
      const result = await res.json();
      // console.log("lastConversations result", result);
      setLastMessages(result);
    } catch (error) {}
  };

  return (
    <DataContext.Provider
      value={{
        user,
        setUser,
        typingStatus,
        setTypingStatus,
        usersList,
        setUsersList,
        selectedUser,
        setSelectedUser,
        lastMessages,
        setLastMessages,
        lastMessageFunc,
        incomingCall, setIncomingCall,
        callData, setCallData,
        isRinging, setIsRinging,
        myCamOff, setMyCamOff,
        remoteCamOff, setRemoteCamOff
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
