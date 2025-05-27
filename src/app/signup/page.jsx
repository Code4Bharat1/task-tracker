import MobileSignup from "@/Component/usersignup/mobilesignup";
import Signup from "@/Component/usersignup/usersignup";

import React from "react";

export default function Home() {
  return (
    <div>
      {/* Desktop View */}
      <div className="hidden md:block">
        <Signup />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileSignup />
      </div>
    </div>
  );
}
