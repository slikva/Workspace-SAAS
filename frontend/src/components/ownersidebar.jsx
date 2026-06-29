import React from "react";
import { Link,useNavigate } from "react-router-dom";
import {
  RiDashboardLine,
  RiBuildingLine,
  RiBarChartLine,
  RiSettingsLine,
  RiLogoutBoxLine,
  RiBuilding3Fill
} from "react-icons/ri";


export default function OwnerSidebar() {
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

      <h1 className="text-4xl font-bold">
        WorkSpace
      </h1>

      <p className="text-blue-100 mt-2">
        Software Owner Panel
      </p>

      <div className="mt-12 space-y-3">

        <Link
          to="/owner-dashboard"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#245A90]"
        >
          <RiDashboardLine />
          Dashboard
        </Link>

        <Link
          to="/companies"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#245A90]"
        >
          <RiBuildingLine />
          Companies
        </Link>
        <Link
            to="/create-company"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#245A90]"
            >
            <RiBuilding3Fill/>
            Create Company
            </Link>

        <Link
          to="/analytics"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#245A90]"
        >
          <RiBarChartLine />
          Analytics
        </Link>

        <Link
          to="/owner-settings"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#245A90]"
        >
          <RiSettingsLine />
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