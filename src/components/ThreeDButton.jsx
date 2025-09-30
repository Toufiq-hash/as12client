// src/components/ThreeDButton.jsx
const ThreeDButton = ({ children, className = "", ...props }) => {
  return (
    <button
      {...props}
      className={`
        relative
        bg-primary
        text-white
        font-semibold
        py-3 px-6
        rounded-lg
        cursor-pointer
        select-none
        transition
        duration-300
        ease-in-out
        shadow-[0_8px_15px_rgba(0,0,0,0.1)]
        hover:shadow-[0_15px_20px_rgba(0,0,0,0.2)]
        active:translate-y-[2px]
        active:shadow-[0_5px_10px_rgba(0,0,0,0.15)]
        ${className}
      `}
      style={{
        transformStyle: "preserve-3d",
        boxShadow: "0 8px 15px rgba(0,0,0,0.1)",
      }}
    >
      {/* Top highlight */}
      <span
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          boxShadow: "inset 0 4px 6px rgba(255, 255, 255, 0.3)",
          zIndex: 1,
        }}
      />
      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default ThreeDButton;
