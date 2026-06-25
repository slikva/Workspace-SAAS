import React,
{
  useEffect,
  useState
}
from "react";

import OwnerSidebar
from "../components/ownersidebar";

import {
  RiBuildingLine,
  RiTeamLine,
  RiUserLine,
  RiMoneyDollarCircleLine
}
from "react-icons/ri";

export default function AnalyticsPage() {

  const [data, setData] =
    useState({});

  useEffect(() => {

    fetch(
      "http://localhost:5001/analytics"
    )
      .then((res) => res.json())
      .then((data) =>
        setData(data)
      );

  }, []);

  const cards = [

    {
      title: "Companies",
      value: data.companies,
      icon: RiBuildingLine
    },

    {
      title: "Managers",
      value: data.managers,
      icon: RiTeamLine
    },

    {
      title: "Employees",
      value: data.employees,
      icon: RiUserLine
    },

    {
      title: "Revenue",
      value: `₹${data.revenue || 0}`,
      icon:
        RiMoneyDollarCircleLine
    }

  ];

  return (

    <div className="flex min-h-screen bg-[#F7F8FA]">

      <OwnerSidebar />

      <div className="flex-1 p-8">

        <h1 className="text-4xl font-bold text-[#163F68]">
          Analytics
        </h1>

        <p className="text-gray-500 mt-2 mb-8">
          Platform performance overview
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {cards.map((item, index) => {

            const Icon =
              item.icon;

            return (

              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm"
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

          })}

        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-[#163F68] mb-6">
            Monthly Growth
          </h2>

          <div className="flex items-center gap-4">

            <div className="text-5xl font-bold text-green-600">
              {data.growth}
            </div>

            <div>

              <p className="text-gray-600">
                Growth compared to last month
              </p>

              <p className="text-sm text-gray-400">
                SaaS Platform Growth
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}