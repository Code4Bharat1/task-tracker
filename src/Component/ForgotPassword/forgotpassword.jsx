'use client';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';

export default function Forgotpassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timer, setTimer] = useState(60);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/forgotpassword/generate-otp`, {
        email,
      });

      localStorage.setItem("email", email);

      if (res.status === 200) {
        toast.success('OTP sent successfully!');
        router.push('/forgotpassword/verifyotp');
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to send OTP. Please try again.'
      );
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email first.");
      return;
    }

    if (isResendDisabled) return;

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/forgotpassword/generate-otp`, {
        email,
      });

      if (res.status === 200) {
        toast.success('OTP resent successfully!').setTimeout(() => {}, 2000);
        router.push('/forgotpassword/verifyotp');
        setIsResendDisabled(true);
        setTimer(60);

        const expiryTimestamp = Date.now() + 60 * 1000;
        Cookies.set('otp-timer-timestamp', expiryTimestamp.toString(), { expires: 1 / 24 }); // expires in 1 hour
        Cookies.set('otp-email', email, { expires: 1 / 24 });
      } else {
        toast.error('Failed to resend OTP.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to resend OTP. Try again.'
      );
    }
  };

  useEffect(() => {
    const savedTimestamp = Cookies.get('otp-timer-timestamp');
    const savedEmail = Cookies.get('otp-email');

    if (savedTimestamp && savedEmail) {
      const now = Date.now();
      const remaining = Math.floor((Number(savedTimestamp) - now) / 1000);

      if (remaining > 0) {
        setEmail(savedEmail);
        setIsResendDisabled(true);
        setTimer(remaining);
      } else {
        Cookies.remove('otp-timer-timestamp');
        Cookies.remove('otp-email');
      }
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isResendDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            Cookies.remove('otp-timer-timestamp');
            Cookies.remove('otp-email');
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResendDisabled, timer]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/loginbg.png')] bg-cover bg-center relative">
      <div className="relative bg-white rounded-lg shadow-lg p-12 w-full max-w-3xl z-10 h-120 text-center">
        <Image src="/image2.png" alt="vector" height={100} width={100} className="absolute top-204.71px left-432.82px rotation-160.01 deg z-0 " />
        <Image src="/image1.png" alt="vector" height={70} width={60} className="absolute top-15 right-10 z-0" />
        <Image src="/image8.png" alt="vector" height={80} width={80} className="absolute top-50 left-5 rotate-[350deg] z-[-1]" />
        <Image src="/image3.png" alt="vector" height={80} width={80} className="absolute bottom-14 left-25 right-30 rotate-[350deg] z-0" />
        <Image src="/image4.png" alt="vector" height={80} width={80} className="absolute top-40 right-40 rotate-[15deg] z-0" />
        <Image src="/image7.png" alt="vector" height={80} width={80} className="absolute top-77 right-10 left-128 z-0" />
        <Image src="/image5.png" alt="vector" height={85} width={85} className="absolute top-64 left-51 z-[-1]" />
        <Image src="/image6.png" alt="vector" height={80} width={80} className="absolute top-7 right-50 z-0" />

        <h2 className="text-[#0077B6] text-3xl font-extrabold mb-6 z-10">Forgot Password</h2>
        <h3 className="text-black text-3xl font-extrabold mb-9 z-10">Request OTP</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-w-6xl">
            <div className="text-left text-black md:px-22">
              <label htmlFor="email" className="block text-lg font-medium mb-1 z-10">
                E-mail / Phone
              </label>
            </div>
            <div className="flex justify-center relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-[500px] px-4 py-2 pr-28 bg-white shadow-md border border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black z-10"
                placeholder="Enter your email address"
                required
              />
              {/* Resend OTP Button */}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResendDisabled}
                className={`absolute leading-10 cursor-pointer right-25 top-10 text-lg z-10 ${isResendDisabled ? "text-gray-400 cursor-not-allowed" : "text-black hover:text-blue-600"
                  }`}
              >
                {isResendDisabled ? `Resend in ${timer}s` : "Resend OTP?"}
              </button>
            </div>
          </div>

          <div className="md:mt-15 z-10">
            <button
              type="submit"
              className="bg-[#018ABE] text-white font-bold py-2 px-25 text-[20px] rounded-lg hover:bg-[#005f94] cursor-pointer z-10"
            >
              Send OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
