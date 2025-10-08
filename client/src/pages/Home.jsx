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
      <div className="bg-gray-700 h-screen w-screen flex flex-col">
        <Header />
        <div className="w-screen flex-1 flex ">
          {user ? (
            <div className="flex w-screen">
              {!isMobile ? (
                <>
                  <div className="flex-1 w-[30%]">
                    <UserListPage />
                  </div>
                  <div className="h-full flex flex-col w-[70%]">
                    <ChatPage />
                  </div>
                </>
              ) : (
                <>
                  {selectedUser && selectedUser.email !== "" ? (
                    <div className="h-full flex flex-col w-full">
                      <ChatPage isMobile={isMobile}/>
                    </div>
                  ): (
                    <div className="flex-1 w-full">
                      <UserListPage />
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="w-full bg-zinc-800 flex flex-col justify-center items-center text-white gap-4">
              <p className="text-4xl font-bold">Chat App</p>
              <p className="text-2xl font-medium text-center p-10">
                Please Login or Signup to continue using app...
              </p>
              <p className="text-red-500 text-xl font-medium -mt-2">
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
