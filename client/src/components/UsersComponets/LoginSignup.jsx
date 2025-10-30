import React from "react";
import { useState } from "react";
import { toast } from "react-toastify";
const url = import.meta.env.VITE_BACKEND_URL;

const LoginSignup = ({ buttonClicked,setButtonClicked, setUser }) => {
  const [field, setField] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({});
  const [Submit, setSubmit] = useState(false)

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
      setSubmit(true);

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
    } finally {
      setSubmit(false)
    }
  };

  return (
   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3">
  <div
    className="min-h-[55vh] sm:min-h-[75vh] md:min-h-[80vh] 
    w-[90vw] sm:w-[80vw] md:w-[55vw] mx-auto
    bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 
    border border-zinc-700 shadow-2xl shadow-black/50 rounded-2xl 
    flex flex-col justify-between items-center 
    p-5 sm:p-8 text-white transition-all duration-300"
  >
    {/* Header */}
    <div className="w-full text-center mt-2">
      <p className="font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-wide text-white/90">
        {buttonClicked} Form
      </p>
      <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mt-2"></div>
    </div>

    {/* Form Fields */}
    <div className="flex flex-col justify-center items-center gap-4 sm:gap-6 w-full flex-1">
      {formField.map((field) => (
        <div key={field.name} className="w-full max-w-md">
          <label className="font-semibold text-sm sm:text-base md:text-lg text-zinc-300 block pb-2">
            {field.name}
          </label>
          <div className="relative">
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
              className="rounded-xl px-4 h-10 sm:h-11 w-full bg-zinc-800 text-white/90 
                placeholder:text-zinc-500 border border-zinc-700 focus:border-blue-500 
                focus:ring-2 focus:ring-blue-600 outline-none transition-all duration-200 text-sm sm:text-base"
              onChange={(e) => handleInputChange(e)}
            />

            {field.type === "password" && (
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer hover:text-white transition"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <i className="ri-eye-off-fill"></i>
                ) : (
                  <i className="ri-eye-fill"></i>
                )}
              </div>
            )}
          </div>

          {error[field.name] && (
            <div className="text-red-400 px-1 mt-1 text-sm font-semibold">
              {error[field.name]}
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Footer / Button */}
    <div className="w-full flex justify-center mb-3 sm:mb-4">
      <button
        className="h-10 sm:h-12 w-32 sm:w-40 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full 
          flex justify-center items-center text-white font-semibold sm:font-bold tracking-wide 
          shadow-lg shadow-blue-900/40 hover:shadow-blue-700/50 hover:scale-[1.02] 
          transition-all duration-200 disabled:opacity-60 text-sm sm:text-base"
        onClick={(e) => handleSubmit(e)}
        disabled={Submit}
      >
        {Submit ? "Submitting..." : "Submit"}
      </button>
    </div>
  </div>
</div>

  );
};

export default LoginSignup;
