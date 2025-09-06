import React, { useState } from "react";
import LoginSignup from "./LoginSignup";
import ProfilePic from "./ProfilePic";
import { useData } from "../context/DataContext";
const url = import.meta.env.VITE_BACKEND_URL;

const Header = () => {
  const {user, setUser, setSelectedUser} = useData()
  const [buttonClicked, setButtonClicked] = useState("");

  const handleLogout = async() => {
   try {
    await fetch(url + "/logout", {
      method: "POST",
      credentials: "include",
    });
   } catch (err) {
    console.log("Logout failed", err)
   }
   
    setUser(null);
    setSelectedUser({
    name: "",
    email: ""
  })
  };
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black w-screen h-16 flex items-center justify-between px-6">
        <h1 className="font-bold text-2xl text-white">Chat App</h1>
        {user ? (
          <div className="flex gap-5">
          <ProfilePic user={user.name} size={"small"}/>
          <div
            className="h-9 flex items-center justify-center bg-gray-800 rounded-2xl w-20 z-20 text-white font-medium hover:bg-gray-900 cursor-pointer"
            onClick={() => handleLogout()}
          >
            Logout
          </div>
          </div>
        ) : (
          <div className="flex gap-6">
            <div
              className="h-9 flex items-center justify-center bg-gray-800 rounded-2xl w-20 z-20 text-white font-medium hover:bg-gray-900 cursor-pointer"
              onClick={() => setButtonClicked("Login")}
            >
              Login
            </div>
            <div
              className="h-9 flex items-center justify-center bg-gray-800 rounded-2xl w-20 z-20 text-white font-medium hover:bg-gray-900 cursor-pointer"
              onClick={() => setButtonClicked("Signup")}
            >
              Signup
            </div>
          </div>
        )}
      </div>
      {buttonClicked ? (
        <div
          className="h-screen w-screen absolute"
          onClick={() => setButtonClicked("")}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <LoginSignup
              buttonClicked={buttonClicked}
              setButtonClicked={setButtonClicked}
              setUser={setUser}
            />
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Header;
