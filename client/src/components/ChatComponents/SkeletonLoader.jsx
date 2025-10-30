const SkeletonLoader = ({ isSender }) => (
 <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3 space-x-2`}>
  {/* Avatar placeholder */}
  {!isSender && (
    <div className="h-9 w-9 rounded-full bg-gray-500/40 animate-pulse shrink-0"></div>
  )}

  {/* Message bubble skeleton */}
  <div
    className={`rounded-2xl animate-pulse
      ${isSender
        ? "bg-gradient-to-r from-green-600/40 via-green-500/40 to-green-600/40"
        : "bg-gradient-to-r from-gray-500/40 via-gray-400/40 to-gray-500/40"}
      min-w-[20%] h-8`}
    style={{
      width: `${Math.floor(Math.random() * 30 + 20)}%`, // 20% to 70%
      maxWidth: "50%",
    }}
  ></div>

  {/* Avatar placeholder for sender */}
  {isSender && (
    <div className="h-9 w-9 rounded-full bg-gray-500/40 animate-pulse shrink-0"></div>
  )}
</div>


);

export default SkeletonLoader
