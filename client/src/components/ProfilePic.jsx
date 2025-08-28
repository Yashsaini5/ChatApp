const ProfilePic = ({ user , size}) => {
  return (
    <div className={`${size == "small" ? "h-9 w-9":"h-11 w-11"} text-black text-xl rounded-full font-semibold flex justify-center items-center bg-zinc-400`}>
      {user?.[0]?.toUpperCase() || "?"}
    </div>
  );
};

export default ProfilePic;