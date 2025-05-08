import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const FancyLoader = () => {
  const spinnerRef = useRef(null);

  useEffect(() => {
    gsap.to(spinnerRef.current, {
      rotation: 360,
      duration: 1,
      repeat: -1, // Infinite loop
      ease: "linear",
    });
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div
        ref={spinnerRef}
        className="w-32 h-32 border-10 border-t-transparent border-blue-500 border-solid rounded-full"
      ></div>
    </div>
  );
};

export default FancyLoader;
