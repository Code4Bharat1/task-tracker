'use client'
import { Bell, Eye, EyeOff, HelpCircle, Lock, Mail, Moon, Settings as SettingsIcon, Shield, Sun, Trash2, User, CheckCircle, AlertCircle, Clock, Globe } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';

const SettingsPage = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState('security');

    // Password change states
    const [email, setEmail] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    // Account states
    const [accountData, setAccountData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        profilePicture: null
    });

    // Other settings states
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        marketing: false
    });

    const [privacy, setPrivacy] = useState({
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        dataCollection: true
    });

    // Check for saved theme preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Timer effect for OTP resend
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(timer - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Toggle theme
    const toggleTheme = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        document.documentElement.classList.toggle('dark', newDarkMode);
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    };

    // Password validation
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    // Show message with type
    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000);
    };

    // Send OTP
    const sendOtp = async () => {
        if (!email.trim()) {
            showMessage("Please enter your email address.", 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage("Please enter a valid email address.", 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/forgotpassword/generate-otp`, {
                email: email.trim(),
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // 10 second timeout
            });

            if (response.status === 200 || response.status === 201) {
                setOtpSent(true);
                setTimer(60); // 1 minute timer
                showMessage("OTP has been sent to your email. Please check your inbox.", 'success');
            }
        } catch (error) {
            console.error('OTP Send Error:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to send OTP. Please check your email and try again.";
            showMessage(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const resendOtp = async () => {
        if (timer > 0) return;
        await sendOtp();
    };

    // Change password
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        // Validation checks
        if (!email.trim()) {
            showMessage("Email address is required.", 'error');
            return;
        }

        if (!otp.trim() || otp.length < 4) {
            showMessage("Please enter a valid OTP (minimum 4 digits).", 'error');
            return;
        }

        if (!newPassword) {
            showMessage("New password is required.", 'error');
            return;
        }

        if (!validatePassword(newPassword)) {
            showMessage(
                'Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&)',
                'error'
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage("Passwords do not match.", 'error');
            return;
        }

        if (!otpSent) {
            showMessage("Please request an OTP first.", 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/forgotpassword/verify-otp`, {
                email: email.trim(),
                otp: otp.trim(),
                newPassword: newPassword,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 15000, // 15 second timeout
            });

            if (response.status === 200 || response.status === 201) {
                showMessage("Password successfully changed! You can now login with your new password.", 'success');
                // Reset form
                setEmail('');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
                setOtpSent(false);
                setTimer(0);
            }
        } catch (error) {
            console.error('Password Change Error:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to change password. Please verify your OTP and try again.";
            showMessage(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Save account information
    const saveAccountInfo = async () => {
        if (!accountData.firstName.trim() || !accountData.lastName.trim()) {
            showMessage("First name and last name are required.", 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/profile`, {
                firstName: accountData.firstName.trim(),
                lastName: accountData.lastName.trim(),
                bio: accountData.bio.trim(),
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming JWT token
                },
                timeout: 10000,
            });

            if (response.status === 200) {
                showMessage("Profile updated successfully!", 'success');
            }
        } catch (error) {
            console.error('Profile Update Error:', error);
            const errorMessage = error.response?.data?.message ||
                "Failed to update profile. Please try again.";
            showMessage(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'appearance', label: 'Appearance', icon: darkMode ? Sun : Moon },
    ];

    return (
        <div className="min-h-screen bg-white transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Enhanced Header */}
                <div className="mb-8 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                        <div className="p-3 bg-blue-100 rounded-2xl">
                            <SettingsIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-blue-900">
                                Settings
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage your account settings and preferences
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Enhanced Sidebar Navigation */}
                    <div className="xl:w-80">
                        <div className="bg-white  backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-2 sticky top-8">
                            <nav className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-200 group ${activeTab === tab.id
                                                    ? 'bg-blue-50 text-blue-600 shadow-sm border-l-4 border-blue-600'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 transition-transform duration-200 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                                                }`} />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Enhanced Main Content */}
                    <div className="flex-1">
                        <div className="bg-white backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">

                            {/* Enhanced Security Tab */}
                            {activeTab === 'security' && (
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Shield className="w-6 h-6 text-blue-600" />
                                        <h2 className="text-2xl font-semibold text-gray-900">Security Settings</h2>
                                    </div>

                                    {/* Message Display */}
                                    {message && (
                                        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${messageType === 'success'
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400'
                                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400'
                                            }`}>
                                            {messageType === 'success' ?
                                                <CheckCircle className="w-5 h-5 flex-shrink-0" /> :
                                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            }
                                            <span>{message}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handlePasswordChange} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
                                                <input
                                                    type="email"
                                                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white  text-gray-900  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Enter your email address"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                type="button"
                                                onClick={sendOtp}
                                                disabled={isLoading || (otpSent && timer > 0)}
                                                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
                                            >
                                                {isLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                                            </button>
                                            {timer > 0 && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 px-4 py-3 bg-gray-50 rounded-xl">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Resend available in {timer}s</span>
                                                </div>
                                            )}
                                        </div>

                                        {otpSent && (
                                            <div className="space-y-6 pt-6 border-t border-gray-200">
                                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                                    <p className="text-blue-800 text-sm">
                                                        We've sent a verification code to your email. Please check your inbox and enter the code below.
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        Verification Code *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white text-gray-900  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg tracking-widest font-mono"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                        placeholder="Enter verification code"
                                                        maxLength="6"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        New Password *
                                                    </label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl bg-white text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            placeholder="Enter new password"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                        Must contain 8+ characters with uppercase, lowercase, number & special character (@$!%*?&)
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        Confirm Password *
                                                    </label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl bg-white text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder="Confirm new password"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full  bg-[#0179a4] text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
                                                >
                                                    {isLoading ? 'Changing Password...' : 'Change Password'}
                                                </button>
                                            </div>
                                        )}
                                    </form>

                                    {/* Two-Factor Authentication */}
                                    {/* <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-600">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Two-Factor Authentication</h3>
                                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                                                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">Authenticator App</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
                                                </div>
                                            </div>
                                            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg">
                                                Enable
                                            </button>
                                        </div>
                                    </div> */}
                                </div>
                            )}
                            

                            {/* Enhanced Appearance Tab */}
                            {activeTab === 'appearance' && (
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        {darkMode ? <Moon className="w-6 h-6 text-blue-600" /> : <Sun className="w-6 h-6 text-yellow-500" />}
                                        <h2 className="text-2xl font-semibold text-gray-900 ">Appearance Settings</h2>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Theme Toggle */}
                                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-xl shadow-lg">
                                                        {darkMode ?
                                                            <Moon className="w-8 h-8 text-blue-600" /> :
                                                            <Sun className="w-8 h-8 text-yellow-500" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-lg">
                                                            {darkMode ? 'Dark Mode' : 'Light Mode'}
                                                        </p>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            Switch between light and dark themes for better viewing experience
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={toggleTheme}
                                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors shadow-lg ${darkMode ? 'bg-blue-600' : 'bg-gray-300'
                                                        }`}
                                                >
                                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'
                                                        }`} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Language Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                                <Globe className="w-5 h-5 inline mr-2" />
                                                Language
                                            </label>
                                            <select className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                                                <option>🇺🇸 English (US)</option>
                                                <option>🇬🇧 English (UK)</option>
                                                <option>🇪🇸 Spanish</option>
                                                <option>🇫🇷 French</option>
                                                <option>🇩🇪 German</option>
                                                <option>🇯🇵 Japanese</option>
                                                <option>🇰🇷 Korean</option>
                                                <option>🇨🇳 Chinese (Simplified)</option>
                                            </select>
                                        </div>

                                        {/* Timezone Selection */}
                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                <Clock className="w-5 h-5 inline mr-2" />
                                                Timezone
                                            </label>
                                            <select className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                                                <option>🌊 UTC-8 (Pacific Time)</option>
                                                <option>🗽 UTC-5 (Eastern Time)</option>
                                                <option>🇬🇧 UTC+0 (GMT)</option>
                                                <option>🇪🇺 UTC+1 (Central European Time)</option>
                                                <option>🇨🇳 UTC+8 (China Standard Time)</option>
                                                <option>🇯🇵 UTC+9 (Japan Standard Time)</option>
                                                <option>🇦🇺 UTC+10 (Australian Eastern Time)</option>
                                            </select>
                                        </div> */}

                                        {/* Font Size */}
                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                Font Size
                                            </label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {['Small', 'Medium', 'Large'].map((size) => (
                                                    <button
                                                        key={size}
                                                        className={`p-4 rounded-xl border-2 transition-all ${size === 'Medium'
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                                                            }`}
                                                    >
                                                        <div className={`font-medium text-gray-900 dark:text-white ${size === 'Small' ? 'text-sm' :
                                                                size === 'Medium' ? 'text-base' : 'text-lg'
                                                            }`}>
                                                            {size}
                                                        </div>
                                                        <div className={`text-gray-600 dark:text-gray-400 ${size === 'Small' ? 'text-xs' :
                                                                size === 'Medium' ? 'text-sm' : 'text-base'
                                                            }`}>
                                                            Sample text
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Enhanced Footer Links */}
                        <div className="mt-8 bg-white flex justify-center backdrop-blur-sm rounded-2xl p-6 border">
                            <div className="flex flex-wrap gap-6 text-sm justify-center lg:justify-start">
                                <Link href="/companyPolicy" className="text-blue-600 transition-colors flex items-center gap-2 font-medium">
                                    <HelpCircle className="w-4 h-4" />
                                    Company Policy
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;