import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  RiTeamLine,
  RiTaskLine,
  RiCalendarLine,
  RiBarChartBoxLine,
  RiAddLine,
} from "react-icons/ri";
export default function DashboardPage() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );
  const [employeeStats, setEmployeeStats] = useState(null);
  useEffect(() => {
  if (currentUser.role === "Employee") {
    fetch(
      `${import.meta.env.VITE_API_URL}/employee-dashboard/${currentUser.user_id}`
    )
      .then(res => res.json())
      .then(data => setEmployeeStats(data));
  }
}, []);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalTasks: 0,
    pendingTasks: 0,
    totalMeetings: 0,
  });
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/dashboard-stats`)
      .then((res) => res.json())
      .then((data) => setStatsData(data))
      .catch((err) => console.log(err));
      fetch(`${import.meta.env.VITE_API_URL}/recent-activities`)
      .then((res) => res.json())
      .then((data) => setActivities(data));
  }, []);
  const stats = currentUser.role === "Employee" ? [
      {
        icon: RiTaskLine,
        title: "My Tasks",
        value: employeeStats?.myTasks || 0,
      },
      {
        icon: RiCalendarLine,
        title: "Meetings",
        value: employeeStats?.meetings || 0,
      },
      {
        icon: RiBarChartBoxLine,
        title: "Pending Tasks",
        value: employeeStats?.pendingTasks || 0,
      },
      {
        icon: RiTeamLine,
        title: "Completed Tasks",
        value: employeeStats?.completedTasks || 0,
      },
    ]
  : [
      {
        icon: RiTeamLine,
        title: "Total Users",
        value: statsData.totalUsers,
      },
      {
        icon: RiTaskLine,
        title: "Total Tasks",
        value: statsData.totalTasks,
      },
      {
        icon: RiCalendarLine,
        title: "Meetings",
        value: statsData.totalMeetings,
      },
      {
        icon: RiBarChartBoxLine,
        title: "Pending Tasks",
        value: statsData.pendingTasks,
      },
    ];
  

  return (
    <main className="flex min-h-screen bg-[#F7F8FA]">

      <Sidebar />

      <div className="flex-1 p-8">

        <div className="mb-8">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-14 h-14 rounded-2xl bg-[#163F68] flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">
                W
              </span>
            </div>

            <div>
              <h2 className="font-bold text-[#163F68] text-xl">
                WorkSpace
              </h2>

              <p className="text-sm text-gray-500">
                Enterprise Platform
              </p>
            </div>

          </div>

          <h1 className="text-4xl font-bold text-[#163F68]">

            Welcome,

            <span className="text-[#C99232] ml-2">
              {currentUser.full_name}
            </span>

          </h1>

          <p className="text-gray-500 mt-2">
            Here's an overview of your workspace today.
          </p>

        </div>

        <div className="bg-gradient-to-r from-[#163F68] to-[#245A90] rounded-3xl p-8 text-white shadow-lg mb-8">

          <h2 className="text-3xl font-bold mb-2">
            WorkSpace Control Center
          </h2>

          <p className="text-blue-100">
            Manage users, tasks, meetings and team collaboration
            from one centralized platform.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {stats.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >

                <div className="flex justify-between items-center mb-4">

                  <div className="w-12 h-12 rounded-xl bg-[#163F68] flex items-center justify-center">

                    <Icon
                      size={22}
                      className="text-white"
                    />

                  </div>

                </div>

                <p className="text-gray-500 text-sm">
                  {item.title}
                </p>

                <h2 className="text-3xl font-bold text-[#163F68] mt-2">
                  {item.value}
                </h2>

              </div>

            );

          })}

        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">

            <h2 className="text-xl font-semibold text-[#163F68] mb-5">
              Recent Activities
            </h2>

           <div className="space-y-4">

{currentUser.role === "Employee" ? (

  employeeStats?.recentTasks?.map((task) => (

    <div
      key={task.task_id}
      className="border-b pb-3"
    >

      <p className="font-medium text-[#163F68]">
        {task.title}
      </p>

      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          task.status === "Completed"
            ? "bg-green-100 text-green-700"
            : task.status === "In Progress"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {task.status}
      </span>

    </div>

  ))

) : (

  activities.map((activity, index) => (

    <div
      key={index}
      className="border-b pb-3"
    >

      <p className="font-medium text-[#163F68]">
        {activity.title}
      </p>

      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          activity.status === "Completed"
            ? "bg-green-100 text-green-700"
            : activity.status === "In Progress"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {activity.status}
      </span>

    </div>

  ))

)}

</div>

          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <h2 className="text-xl font-semibold text-[#163F68] mb-5">
              Quick Actions
            </h2>

            <div className="space-y-3">

              {currentUser.role === "Manager" && (
                <>
                  <button onClick={() => navigate("/users")} className="w-full border border-gray-200 p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50">

                    <RiAddLine />

                    Add User

                  </button>

                  <button onClick={() => navigate("/tasks")} className="w-full border border-gray-200 p-3 rounded-xl hover:bg-gray-50">
                    Create Task
                  </button>

                  <button onClick={() => navigate("/calendar")} className="w-full border border-gray-200 p-3 rounded-xl hover:bg-gray-50">
                    Schedule Meeting
                  </button>
                </>
              )}

              <button className="w-full border border-gray-200 p-3 rounded-xl hover:bg-gray-50">
                View Reports
              </button>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}