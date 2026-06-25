import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import {RiUserLine, RiLockPasswordLine, RiNotification3Line, RiMailLine,RiShieldUserLine,RiSaveLine} from "react-icons/ri";
export default function SettingsPage() {
  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );
  const [profile, setProfile] = useState({
    full_name: currentUser.full_name || "",
    email: currentUser.email || "",
  });
  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    taskUpdates: true,
    meetingReminders: true,
  });
  const saveProfile = () => {
    alert("Profile Updated");
  };
  const changePassword = () => {
    if (
      password.newPassword !== password.confirmPassword
    ) {
      alert("Passwords do not match");
      return;
    }
    alert("Password Changed");
  };
  return (
    <main className="flex min-h-screen bg-[#F7F8FA]">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#163F68]">
            Settings
          </h1>
          <p className="text-gray-500 mt-2">
            Manage your account preferences and security.
          </p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm mb-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[#163F68] flex items-center justify-center text-white text-3xl font-bold">
              {currentUser.full_name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#163F68]">{currentUser.full_name}</h2>
              <p className="text-gray-500">{currentUser.email} </p>
              <span className="inline-block mt-2 px-3 py-1 bg-[#C99232]/20 text-[#C99232] rounded-full text-sm font-medium">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>
        

        <div className="grid lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <div className="flex items-center gap-3 mb-6">

              <RiUserLine
                size={24}
                className="text-[#163F68]"
              />

              <h2 className="text-xl font-bold text-[#163F68]">
                Profile Information
              </h2>

            </div>

            <div className="space-y-4">

              <input
                type="text"
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    full_name: e.target.value
                  })
                }
                className="w-full border p-3 rounded-xl"
                placeholder="Full Name"
              />

              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    email: e.target.value
                  })
                }
                className="w-full border p-3 rounded-xl"
                placeholder="Email"
              />

              <button
                onClick={saveProfile}
                className="bg-[#163F68] hover:bg-[#C99328] text-white px-5 py-3 rounded-xl flex items-center gap-2"
              >
                <RiSaveLine />
                Save Changes
              </button>

            </div>

          </div>

          

          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <div className="flex items-center gap-3 mb-6">

              <RiLockPasswordLine
                size={24}
                className="text-[#163F68]"
              />

              <h2 className="text-xl font-bold text-[#163F68]">
                Change Password
              </h2>

            </div>

            <div className="space-y-4">

              <input
                type="password"
                placeholder="Current Password"
                className="w-full border p-3 rounded-xl"
                onChange={(e) =>
                  setPassword({
                    ...password,
                    current: e.target.value
                  })
                }
              />

              <input
                type="password"
                placeholder="New Password"
                className="w-full border p-3 rounded-xl"
                onChange={(e) =>
                  setPassword({
                    ...password,
                    newPassword: e.target.value
                  })
                }
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full border p-3 rounded-xl"
                onChange={(e) =>
                  setPassword({
                    ...password,
                    confirmPassword: e.target.value
                  })
                }
              />

              <button
                onClick={changePassword}
                className="bg-[#163F68] hover:bg-[#C99328] text-white px-5 py-3 rounded-xl"
              >
                Update Password
              </button>

            </div>

          </div>

          
          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <div className="flex items-center gap-3 mb-6">

              <RiNotification3Line
                size={24}
                className="text-[#163F68]"
              />

              <h2 className="text-xl font-bold text-[#163F68]">
                Notifications
              </h2>

            </div>

            <div className="space-y-4">

              <label className="flex justify-between items-center">

                Email Notifications

                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      email: !notifications.email
                    })
                  }
                />

              </label>

              <label className="flex justify-between items-center">

                Task Updates

                <input
                  type="checkbox"
                  checked={notifications.taskUpdates}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      taskUpdates:
                        !notifications.taskUpdates
                    })
                  }
                />

              </label>

              <label className="flex justify-between items-center">

                Meeting Reminders

                <input
                  type="checkbox"
                  checked={notifications.meetingReminders}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      meetingReminders:
                        !notifications.meetingReminders
                    })
                  }
                />

              </label>

            </div>

          </div>

          

          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <div className="flex items-center gap-3 mb-6">

              <RiShieldUserLine
                size={24}
                className="text-[#163F68]"
              />

              <h2 className="text-xl font-bold text-[#163F68]">
                Account Information
              </h2>

            </div>

            <div className="space-y-4">

              <div>
                <p className="text-gray-500 text-sm">
                  User Role
                </p>

                <p className="font-semibold">
                  {currentUser.role}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Email
                </p>

                <p className="font-semibold">
                  {currentUser.email}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Platform
                </p>

                <p className="font-semibold">
                  WorkSpace Enterprise
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Status
                </p>

                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Active
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}