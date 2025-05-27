import PasswordResetForm from "@/Component/forgetpasswordSecond/forgetpasswordSecond";
import MobileRequestOTP from "@/Component/forgetpasswordSecond/mobileotp";

import React from "react";

export default function Home() {
  return (
    <div>
      {/* Desktop View */}
      <div className="hidden md:block">
        <PasswordResetForm />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileRequestOTP />
      </div>
    </div>
  );
}
