import React, { useState } from "react";
import OwnerSidebar from "../components/ownersidebar";
import {
  RiUserLine,
  RiLockPasswordLine,
  RiSettings3Line,
  RiInformationLine,
} from "react-icons/ri";

export default function OwnerSettingsPage() {

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [profile, setProfile] = useState({
    full_name:
      currentUser?.full_name ||
      "Software Owner",

    email:
      currentUser?.email ||
      "owner@workspace.com",

    phone:
      "+91 9876543210"
  });

  const [platform, setPlatform] =
    useState({
      platformName:
        "WorkSpace SaaS",

      supportEmail:
        "support@workspace.com",

      website:
        "www.workspace.com",

      timezone:
        "Asia/Kolkata"
    });

  const [password, setPassword] =
    useState({
      newPassword: "",
      confirmPassword: ""
    });

  const saveProfile = () => {
    alert("Profile Updated");
  };

  const savePlatform = () => {
    alert("Platform Settings Updated");
  };

  const changePassword = () => {

    if (
      password.newPassword !==
      password.confirmPassword
    ) {

      alert(
        "Passwords do not match"
      );

      return;
    }

    alert(
      "Password Updated Successfully"
    );
  };

  return (

    <div className="flex min-h-screen bg-[#F7F8FA]">

      <OwnerSidebar />

      <div className="flex-1 p-8">

   

        <div className="mb-8">

          <h1 className="text-4xl font-bold text-[#163F68]">
            Settings
          </h1>

          <p className="text-gray-500 mt-2">
            Manage platform settings
            and account preferences
          </p>

        </div>

    

        <div className="bg-white rounded-3xl p-8 shadow-sm mb-6">

          <div className="flex items-center gap-3 mb-6">

            <RiUserLine
              size={28}
              className="text-[#163F68]"
            />

            <h2 className="text-2xl font-bold text-[#163F68]">
              Profile Settings
            </h2>

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            <input
              type="text"
              placeholder="Full Name"
              value={profile.full_name}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  full_name:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              type="email"
              placeholder="Email"
              value={profile.email}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  email:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              type="text"
              placeholder="Phone"
              value={profile.phone}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  phone:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

          </div>

          <button
            onClick={saveProfile}
            className="mt-5 bg-[#163F68] text-white px-6 py-3 rounded-xl hover:bg-[#245A90]"
          >
            Save Profile
          </button>

        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm mb-6">

          <div className="flex items-center gap-3 mb-6">

            <RiSettings3Line
              size={28}
              className="text-[#163F68]"
            />

            <h2 className="text-2xl font-bold text-[#163F68]">
              Platform Settings
            </h2>

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            <input
              type="text"
              value={
                platform.platformName
              }
              onChange={(e) =>
                setPlatform({
                  ...platform,
                  platformName:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              type="email"
              value={
                platform.supportEmail
              }
              onChange={(e) =>
                setPlatform({
                  ...platform,
                  supportEmail:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              type="text"
              value={
                platform.website
              }
              onChange={(e) =>
                setPlatform({
                  ...platform,
                  website:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              type="text"
              value={
                platform.timezone
              }
              onChange={(e) =>
                setPlatform({
                  ...platform,
                  timezone:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

          </div>

          <button
            onClick={savePlatform}
            className="mt-5 bg-[#163F68] text-white px-6 py-3 rounded-xl hover:bg-[#245A90]"
          >
            Save Platform
          </button>

        </div>


        <div className="bg-white rounded-3xl p-8 shadow-sm mb-6">

          <div className="flex items-center gap-3 mb-6">

            <RiLockPasswordLine
              size={28}
              className="text-[#163F68]"
            />

            <h2 className="text-2xl font-bold text-[#163F68]">
              Security
            </h2>

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            <input
              type="password"
              placeholder="New Password"
              value={
                password.newPassword
              }
              onChange={(e) =>
                setPassword({
                  ...password,
                  newPassword:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={
                password.confirmPassword
              }
              onChange={(e) =>
                setPassword({
                  ...password,
                  confirmPassword:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

          </div>

          <button
            onClick={changePassword}
            className="mt-5 bg-[#163F68] text-white px-6 py-3 rounded-xl hover:bg-[#245A90]"
          >
            Update Password
          </button>

        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">

          <div className="flex items-center gap-3 mb-6">

            <RiInformationLine
              size={28}
              className="text-[#163F68]"
            />

            <h2 className="text-2xl font-bold text-[#163F68]">
              System Information
            </h2>

          </div>

          <div className="grid md:grid-cols-4 gap-5">

            <div className="bg-[#F7F8FA] rounded-2xl p-5">

              <p className="text-gray-500 text-sm">
                Version
              </p>

              <h3 className="text-xl font-bold text-[#163F68]">
                1.0.0
              </h3>

            </div>

            <div className="bg-[#F7F8FA] rounded-2xl p-5">

              <p className="text-gray-500 text-sm">
                Platform
              </p>

              <h3 className="text-xl font-bold text-[#163F68]">
                WorkSpace
              </h3>

            </div>

            <div className="bg-[#F7F8FA] rounded-2xl p-5">

              <p className="text-gray-500 text-sm">
                Environment
              </p>

              <h3 className="text-xl font-bold text-green-600">
                Production
              </h3>

            </div>

            <div className="bg-[#F7F8FA] rounded-2xl p-5">

              <p className="text-gray-500 text-sm">
                Status
              </p>

              <h3 className="text-xl font-bold text-green-600">
                Active
              </h3>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}