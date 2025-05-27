import Forgotpassword from "@/Component/ForgotPassword/forgotpassword";
import MobileForgotPassword from "@/Component/ForgotPassword/mobileforgot";

import React from "react";

export default function Home() {
  return (
    <div>
      {/* Desktop View */}
      <div className="hidden md:block">
        <Forgotpassword />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileForgotPassword />
      </div>
    </div>
  );
}
