"use client";

import { useEffect, useState } from "react";
import NavBar from "@/Component/Navbar/navbar";
import Sidebar from "@/Component/Usersidebar/usersidebar";
import Image from "next/image";
import { FaRegEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import { Loader, Save } from 'lucide-react';
import FancyLoader from "@/Component/FancyLoader";

function Page() {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // New state to track edit mode
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        position: '',
        gender: '',
        address: '',
        dateOfJoining: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/profile/getProfile`, {
                    credentials: "include", // required to send cookies
                });
                const data = await res.json();
                setProfile(data);
                setFormData({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    position: data.position || 'Employee',
                    gender: data.Gender || '-', // placeholder, update if available
                    address: data.Address || '-', // placeholder, update if available
                    dateOfJoining: data.DateOfJoining || '-', // placeholder, update if available
                });
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    console.log('Profile:', formData);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/profile/updateProfile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',  // Ensure you're sending cookies for authentication
            });

            if (res.ok) {
                const data = await res.json();
                toast.success('Profile updated successfully!');
            } else {
                console.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };


    if (!profile) return <div className="p-6 text-xl h-screen flex items-center justify-center"><FancyLoader /></div>;

    return (
        <div className="min-h-screen md:flex bg-white">
            {/* Sidebar */}
            <div className="md:w-1/6">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="w-full md:w-5/6 h-screen bg-white">
                <NavBar />
                <div className="flex flex-col gap-6 py-4 px-12 pr-24">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-[700]">My Profile</h1>
                            <div className="h-1 w-[70%] bg-[#FFB006] mt-1"></div>
                        </div>
                        <button
                            className="px-7 rounded-2xl h-12 text-lg font-semibold flex items-center gap-3 bg-[#018ABE] cursor-pointer text-white"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? (<button className="flex items-center gap-2" onClick={handleSubmit}><Save />Save</button>) : (<><FaRegEdit />Edit</>)}
                        </button>
                    </div>

                    <div className="w-full h-78 bg-linear-to-b from-[#018ABE] to-[#004058] rounded-2xl relative shadow-xl mb-8">
                        <Image src="/profile/lock.png" alt="Lock Icon" width={107} height={107} className="absolute opacity-50 top-4 left-4 -rotate-[19.89deg]" />
                        <Image src="/profile/Vector92.png" alt="Vector" width={57} height={69} className="absolute opacity-50 bottom-8 left-8" />
                        <Image src={profile.photoUrl || "/profile.png"} alt="Profile Picture" width={1000} height={1000} className="absolute top-10 left-[10%] h-[220px] w-[235px] object-cover rounded-full" />
                        <Image src="/profile/flagVector.png" alt="Flag Vector" width={49} height={71} className="absolute opacity-50 top-10 left-[33%]" />
                        <Image src="/profile/pencil.png" alt="Vector" width={113} height={147} className="absolute opacity-50 top-6 left-[45%]" />
                        <Image src="/profile/key.png" alt="Key Icon" width={151} height={150} className="absolute opacity-50 bottom-2 left-[35%]" />
                        <div className="absolute top-16 right-[15%] text-white">
                            <h1 className="text-4xl font-[700] mb-2">{profile.firstName} {profile.lastName}</h1>
                            <h2 className="text-3xl font-[400] mb-2">{profile.phoneNumber}</h2>
                            <h3 className="text-3xl font-[400] mb-2">{profile.email}</h3>
                            <h4 className="text-3xl font-[400] mb-2">{profile.position || "Employee"}</h4>
                        </div>
                        <Image src="/profile/flippedFlag.png" alt="Flipped Flag" width={68} height={125} className="absolute opacity-50 top-5 right-[5%]" />
                        <Image src="/profile/flippedPencil.png" alt="Flipped Pencil" width={113} height={147} className="absolute opacity-50 bottom-10 right-[10%]" />
                    </div>
                    {/* Profile Card */}


                    {/* Form with pre-filled values */}
                    <form className="flex flex-col gap-8 w-full mb-8" onSubmit={handleSubmit}>
                        <div className="flex justify-between w-full gap-28">
                            <div className="w-full flex flex-col">
                                <label htmlFor="fName" className="text-xl font-[400]">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                />
                            </div>
                            <div className="w-full flex flex-col">
                                <label htmlFor="lName" className="text-xl font-[400]">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow  disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between w-full gap-28">
                            <div className="w-full flex flex-col">
                                <label htmlFor="mobile" className="text-xl font-[400]">Mobile Number</label>
                                <input
                                    type="text"
                                    id="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                />
                            </div>
                            <div className="w-full flex flex-col">
                                <label htmlFor="email" className="text-xl font-[400]">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between w-full gap-28">
                            <div className="w-full flex flex-col">
                                <label htmlFor="designation" className="text-xl font-[400]">Designation</label>
                                <input
                                    type="text"
                                    id="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                />
                            </div>
                            <div className="w-full flex flex-col">
                                <label htmlFor="gender" className="text-xl font-[400]">Gender</label>
                                <input
                                    type="text"
                                    id="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between w-full gap-28">
                            <div className="w-full flex flex-col">
                                <label htmlFor="address" className="text-xl font-[400]">Address</label>
                                <textarea
                                    rows={3}
                                    id="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none resize-none"
                                />
                            </div>
                            <div className="w-full flex flex-col">
                                <label htmlFor="dateOfJoining" className="text-xl font-[400]">Date of Joining</label>
                                <input
                                    type="text"
                                    id="dateOfJoining"
                                    value={formData.dateOfJoining}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="px-4 py-2 rounded-xl shadow disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Page;
