import React from "react";
import { useState } from "react";
import { toast } from "react-toastify";
const url = import.meta.env.VITE_BACKEND_URL;

const LoginSignup = ({ buttonClicked,setButtonClicked, setUser }) => {
  const [field, setField] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({});

  const formField =
    buttonClicked == "Login"
      ? [
          { name: "Email", type: "email", placeholder: "Enter your email" },
          { name: "Password", type: "password", placeholder: "●●●●●●" },
        ]
      : [
          { name: "Name", type: "name", placeholder: "Enter your name" },
          { name: "Email", type: "email", placeholder: "Enter your email" },
          { name: "Password", type: "password", placeholder: "●●●●●●" },
        ];
  const apiUrl = buttonClicked == "Login" ? url + "/user/login": url + "/user/signup"

  const handleInputChange = (e) => {
    setField({ ...field, [e.target.name]: e.target.value });
  };

  const validator = () => {
    const newError = {};

    formField.forEach((type) => {
      const value = field[type.name];

      if (!value?.trim()) newError[type.name] = `${type.name} is required!`;
      else if (type.name === "password" && value.length < 6)
        newError.password = "password must be 6 character long";
    });
    setError(newError);
    return Object.keys(newError).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validator()) return;

    try {
      const response = await fetch(apiUrl , {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(field),
      });

      
      const result = await response.json()
      if(response.status === 200 ){
        toast.success(result.message)
        setUser({_id: result._id, name:result.name, email:result.email})
        setButtonClicked("")
      }
      else if (response.status === 400 )toast.error(result.message)
    } catch (error) {
      console.log(error);
    }
  };

  return (
   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
  <div className="h-[70vh] w-[90vw] sm:w-[70vw] md:w-[60vw] bg-zinc-500 flex flex-col justify-center items-center gap-6 p-4 rounded-xl">
    <p className="font-bold text-2xl sm:text-3xl">{buttonClicked} Form</p>
    {formField.map((field) => (
      <div key={field.name} className="w-full max-w-md">
        <label className="font-semibold text-lg sm:text-xl block pb-2">
          {field.name}:
        </label>
        <input
          type={
            field.type === "password"
              ? showPassword
                ? "text"
                : "password"
              : field.type
          }
          placeholder={field.placeholder}
          name={field.name}
          className="rounded-lg px-3 h-10 w-full focus:outline-none"
          onChange={(e) => handleInputChange(e)}
        />
        {field.type === "password" && (
          <div
            className="-mt-7 w-full text-right cursor-pointer pr-2"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <i className="ri-eye-off-fill"></i>
            ) : (
              <i className="ri-eye-fill"></i>
            )}
          </div>
        )}
        {error[field.name] && (
          <div className="text-red-300 px-1 mt-1 text-sm font-semibold">
            {error[field.name]}
          </div>
        )}
      </div>
    ))}
    <div
      className="h-12 w-28 bg-zinc-700 rounded-3xl flex justify-center items-center text-white font-semibold shadow-gray-950 shadow-sm cursor-pointer hover:bg-zinc-800"
      onClick={(e) => handleSubmit(e)}
    >
      Submit
    </div>
  </div>
</div>

  );
};

export default LoginSignup;
