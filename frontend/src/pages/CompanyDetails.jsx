import React,
{
  useEffect,
  useState
}
from "react";

import {
  useParams
}
from "react-router-dom";

import OwnerSidebar
from "../components/ownersidebar";

import {
  RiBuildingLine,
  RiMailLine,
  RiUserLine
}
from "react-icons/ri";

export default function CompanyDetailsPage() {

  const { id } = useParams();

  const [company, setCompany] =
    useState(null);

  const [users, setUsers] =
    useState([]);

  useEffect(() => {

    fetch(
      `${import.meta.env.VITE_API_URL}/company-details/${id}`
    )
      .then((res) => res.json())
      .then((data) => {

        setCompany(
          data.company
        );

        setUsers(
          data.users
        );

      });

  }, [id]);

  if (!company)
    return (
      <div>
        Loading...
      </div>
    );

  return (

    <div className="flex min-h-screen bg-[#F7F8FA]">

      <OwnerSidebar />

      <div className="flex-1 p-8">

        <div className="bg-white rounded-3xl p-8 shadow-sm mb-8">

          <div className="flex items-center gap-4 mb-6">

            <div className="w-16 h-16 rounded-2xl bg-[#163F68] flex items-center justify-center">

              <RiBuildingLine
                className="text-white"
                size={30}
              />

            </div>

            <div>

              <h1 className="text-4xl font-bold text-[#163F68]">

                {company.company_name}

              </h1>

              <p className="text-gray-500">
                Company Overview
              </p>

            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="bg-[#F7F8FA] rounded-2xl p-5">

              <p className="text-sm text-gray-500 mb-2">
                Company Email
              </p>

              <div className="flex items-center gap-2">

                <RiMailLine />

                <span>
                  {company.company_email}
                </span>

              </div>

            </div>

            <div className="bg-[#F7F8FA] rounded-2xl p-5">

              <p className="text-sm text-gray-500 mb-2">
                Subscription
              </p>

              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">

                {company.subscription_plan}

              </span>

            </div>

            <div className="bg-[#F7F8FA] rounded-2xl p-5">

              <p className="text-sm text-gray-500 mb-2">
                Revenue
              </p>

              <h3 className="text-2xl font-bold text-[#163F68]">

                ₹
                {company.monthly_revenue}

              </h3>

            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-[#163F68] mb-6">

            Company Users

          </h2>

          <table className="w-full">

            <thead>

              <tr className="bg-[#163F68] text-white">

                <th className="p-4 text-left">
                  Name
                </th>

                <th className="p-4 text-left">
                  Email
                </th>

                <th className="p-4 text-left">
                  Role
                </th>

              </tr>

            </thead>

            <tbody>

              {users.map((user) => (

                <tr
                  key={user.user_id}
                  className="border-b"
                >

                  <td className="p-4">

                    <div className="flex items-center gap-2">

                      <RiUserLine />

                      {user.full_name}

                    </div>

                  </td>

                  <td className="p-4">
                    {user.email}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        user.role ===
                        "Manager"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}