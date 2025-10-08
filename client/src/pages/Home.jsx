import { useEffect, useState } from "react";
import Header from "../components/Header";
import ChatPage from "./ChatPage";
import UserListPage from "./UserListPage";
import { useData } from "../context/DataContext";
const url = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const { user, setUser, selectedUser, setSelectedUser } = useData();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 500);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(url + "/user/getUser", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) setUser(data);
    };

    fetchUser();

    const handleResize = () => setIsMobile(window.innerWidth < 500);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <>
    <div className="bg-gray-900 min-h-screen w-screen flex flex-col">
  <Header />
  <div className="w-full flex-1 flex">
    {user ? (
      <div className="flex w-full">
        {!isMobile ? (
          <>
            <div className="flex-1 w-[30%] border-r border-gray-700 shadow-md bg-gray-800">
              <UserListPage />
            </div>
            <div className="h-full flex flex-col w-[70%] bg-gray-900 shadow-inner">
              <ChatPage />
            </div>
          </>
        ) : (
          <>
            {selectedUser && selectedUser.email !== "" ? (
              <div className="h-full flex flex-col w-full bg-gray-900 shadow-inner">
                <ChatPage isMobile={isMobile} />
              </div>
            ) : (
              <div className="flex-1 w-full bg-gray-800 shadow-md">
                <UserListPage />
              </div>
            )}
          </>
        )}
      </div>
    ) : (
      <div className="w-full flex flex-col justify-center items-center text-white gap-6 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-10 rounded-lg shadow-lg m-4">
        <p className="text-5xl font-extrabold tracking-wide">Chat App</p>
        <p className="text-2xl text-center font-medium px-6">
          Please Login or Signup to continue using the app...
        </p>
        <p className="text-red-500 text-xl font-semibold animate-pulse">
          Login / Signup Required!
        </p>
      </div>
    )}
  </div>
</div>

    </>
  );
};

export default Home;
