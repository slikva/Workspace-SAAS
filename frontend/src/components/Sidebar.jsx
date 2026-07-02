import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  RiUserLine,
  RiDashboardLine,
  RiTaskLine,
  RiCalendarLine,
  RiMessage2Line,
  RiSettings3Line,
  RiLogoutBoxLine
} from "react-icons/ri";

export default function Sidebar() {
  const currentUser = JSON.parse(
  localStorage.getItem("user") || "{}"
  
);
const [totalUnread, setTotalUnread] = useState(0);
useEffect(() => {

  if (!currentUser.user_id) return;

  const loadUnread = async () => {

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/notifications/${currentUser.user_id}`
    );

    const data = await res.json();

    setTotalUnread(data.length);

  };

  loadUnread();

  const interval = setInterval(loadUnread, 3000);

  window.addEventListener("notificationsUpdated", loadUnread);

  return () => {

    clearInterval(interval);

    window.removeEventListener("notificationsUpdated", loadUnread);

  };

}, []);
const navigate = useNavigate();
const handleLogout = () => {
  const confirmLogout = window.confirm(
    "Are you sure you want to log out?"
    
  );

  if (confirmLogout) {
    localStorage.removeItem("user");
    navigate("/");
  }
};
  return (
    
    <div className="w-64 min-h-screen bg-[#163F68] text-white p-6">

      <h1 className="text-3xl font-bold">Shnoor WorkSpace</h1>
      <p className="text-sm text-gray-300 mb-10">
        Enterprise Platform
      </p>

      <div className="space-y-3">

        
        {currentUser?.role === "Manager" && (
        <Link to="/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10">
          <RiUserLine />
          Users
        </Link>)}

        <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10">
          <RiDashboardLine />
          Dashboard
        </Link>

          
        <Link to="/tasks" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10">
          <RiTaskLine />
          Tasks
        </Link>

       
        <Link to="/calendar" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10">
          <RiCalendarLine />
          Calendar
        </Link>

       <Link
          to="/chat"
          className="flex items-center justify-between px-4 py-3"
        >

          <div className="flex items-center gap-3">

            <RiMessage2Line />

            <span>Chat</span>

          </div>

          {totalUnread > 0 && (

            <span className="bg-red-500 text-white text-xs font-semibold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-2">

              {totalUnread}

            </span>

          )}

        </Link>

        <Link to="/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10">
          <RiSettings3Line />
          Settings
        </Link>
        <button onClick={handleLogout}  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 w-full text-left">
          <RiLogoutBoxLine />
            Log Out
        </button>

      </div>
    </div>
  );
}