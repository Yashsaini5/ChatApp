import React, { useState } from "react";
import LoginSignup from "./LoginSignup";
import ProfilePic from "./ProfilePic";
import { useData } from "../../context/DataContext";
const url = import.meta.env.VITE_BACKEND_URL;

const Header = () => {
  const {user, setUser, setSelectedUser} = useData()
  const [buttonClicked, setButtonClicked] = useState("");

  const handleLogout = async() => {
   try {
    const response = await fetch(url + "/user/logout", {
      method: "POST",
      credentials: "include",
    });
    if(response.ok){
    setUser(null);
    setSelectedUser({
    name: "",
    email: ""
  })}
   } catch (err) {
    console.log("Logout failed", err)
   }
  };
  return (
   <div className="flex flex-col items-center w-full">
  <div className="bg-gray-900 w-full h-16 flex items-center justify-between px-6 shadow-lg">
    <h1 className="font-extrabold text-2xl text-white tracking-tight">Chat App</h1>
    {user ? (
      <div className="flex items-center gap-4">
        <ProfilePic user={user.name} size={"small"} />
        <div
          className="h-10 flex items-center justify-center bg-red-600 rounded-xl px-4 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer shadow"
          onClick={() => handleLogout()}
        >
          Logout
        </div>
      </div>
    ) : (
      <div className="flex gap-4">
        <div
          className="h-10 flex items-center justify-center bg-gray-800 rounded-xl px-4 text-white font-medium hover:bg-gray-700 transition-colors cursor-pointer shadow"
          onClick={() => setButtonClicked("Login")}
        >
          Login
        </div>
        <div
          className="h-10 flex items-center justify-center bg-gray-800 rounded-xl px-4 text-white font-medium hover:bg-gray-700 transition-colors cursor-pointer shadow"
          onClick={() => setButtonClicked("Signup")}
        >
          Signup
        </div>
      </div>
    )}
  </div>

  {buttonClicked && (
    <div
      className="h-screen w-screen fixed top-0 left-0 bg-black/50 flex justify-center items-center z-50"
      onClick={() => setButtonClicked("")}
    >
      <div onClick={(e) => e.stopPropagation()} className="bg-gray-900 p-6 rounded-xl shadow-xl">
        <LoginSignup
          buttonClicked={buttonClicked}
          setButtonClicked={setButtonClicked}
          setUser={setUser}
        />
      </div>
    </div>
  )}
</div>
  );
};

export default Header;
