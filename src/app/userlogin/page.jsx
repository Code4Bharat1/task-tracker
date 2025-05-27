LOGIN;
import MobileLogin from "@/Component/Userloginpage/mobilelogin";
import Userloginpage from "@/Component/Userloginpage/userloginpage";

import React from "react";

export default function Home() {
  return (
    <div>
      {/* Desktop View */}
      <div className="hidden md:block">
        <Userloginpage />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileLogin />
      </div>
    </div>
  );
}
