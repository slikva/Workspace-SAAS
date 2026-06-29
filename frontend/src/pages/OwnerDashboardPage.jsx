import React, {
  useEffect,
  useState
} from "react";

import OwnerSidebar from "../components/ownersidebar";

import {
  RiBuildingLine,
  RiTeamLine,
  RiUserLine,
  RiVipCrownLine
} from "react-icons/ri";

export default function OwnerDashboardPage() {

  const [stats, setStats] =
    useState({});

  useEffect(() => {

    fetch(
      `${import.meta.env.VITE_API_URL}/owner-dashboard`
    )
      .then((res) => res.json())
      .then((data) =>
        setStats(data)
      );

  }, []);

  const cards = [

  {
    title: "Total Companies",
    value: stats.totalCompanies,
    icon: RiBuildingLine
  },

  {
    title: "Managers",
    value: stats.totalManagers,
    icon: RiTeamLine
  },

  {
    title: "Employees",
    value: stats.totalEmployees,
    icon: RiUserLine
  },

  {
    title: "Revenue",
    value: `₹${stats.totalRevenue || 0}`,
    icon: RiVipCrownLine
  }

];

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">

      <OwnerSidebar />

      <div className="flex-1 p-8">

        <div className="mb-8">

          <h1 className="text-4xl font-bold text-[#163F68]">
            Software Owner Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Overview of all companies
            using WorkSpace
          </p>

        </div>

        <div className="bg-gradient-to-r from-[#163F68] to-[#245A90] rounded-3xl p-8 text-white mb-8 shadow-lg">

          <h2 className="text-3xl font-bold">
            SaaS Control Center
          </h2>

          <p className="mt-2 text-blue-100">
            Monitor companies,
            subscriptions and growth.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {cards.map(
            (item, index) => {

              const Icon =
                item.icon;

              return (

                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
                >

                  <div className="w-12 h-12 rounded-xl bg-[#163F68] flex items-center justify-center mb-4">

                    <Icon
                      size={22}
                      className="text-white"
                    />

                  </div>

                  <p className="text-gray-500">
                    {item.title}
                  </p>

                  <h3 className="text-3xl font-bold text-[#163F68] mt-2">
                    {item.value}
                  </h3>

                </div>

              );
            }
          )}

        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">

  <h2 className="text-xl font-bold text-[#163F68] mb-5">
    Recent Companies
  </h2>

  <div className="space-y-4">

    {stats.recentCompanies?.map(
      (company) => (

      <div
        key={company.company_id}
        className="flex justify-between border-b pb-3"
      >

        <div>

          <h3 className="font-semibold text-[#163F68]">
            {company.company_name}
          </h3>

          <p className="text-sm text-gray-500">
            {company.company_email}
          </p>

        </div>

        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm-centre">

          {company.subscription_plan}

        </span>

      </div>

    ))}

  </div>

</div>

        <div className="grid lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <h2 className="text-xl font-bold text-[#163F68] mb-4">
              Platform Overview
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between">
                <span>
                  Registered Companies
                </span>

                <span className="font-bold">
                  {stats.totalCompanies}
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  Active Managers
                </span>

                <span className="font-bold">
                  {stats.totalManagers}
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  Employees
                </span>

                <span className="font-bold">
                  {stats.totalEmployees}
                </span>
              </div>

            </div>

          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <h2 className="text-xl font-bold text-[#163F68] mb-4">
              Subscription Status
            </h2>

            <div className="space-y-4">

              <div className="p-4 rounded-xl bg-green-50 border border-green-100">

                <p className="font-semibold text-green-700">
                  Premium Plans
                </p>

                <p className="text-2xl font-bold">
                  {stats.premiumCompanies}
                </p>

              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">

                <p className="font-semibold text-blue-700">
                  Platform Health
                </p>

                <p className="text-2xl font-bold">
                  Excellent
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}