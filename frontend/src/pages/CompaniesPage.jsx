import React, {
  useEffect,
  useState
} from "react";
import { Link } from "react-router-dom";
import OwnerSidebar from "../components/ownersidebar";

import {
  RiBuildingLine,
  RiMailLine
} from "react-icons/ri";

export default function CompaniesPage() {

  const [companies, setCompanies] =
    useState([]);

  useEffect(() => {

    fetch(
      `${import.meta.env.VITE_API_URL}/companies`
    )
      .then((res) => res.json())
      .then((data) =>
        setCompanies(data)
      );

  }, []);

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">

      <OwnerSidebar />

      <div className="flex-1 p-8">

        <h1 className="text-4xl font-bold text-[#163F68] mb-2">
          Companies
        </h1>

        <p className="text-gray-500 mb-8">
          Registered organizations
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {companies.map((company) => (

            <div
              key={company.company_id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
            >
                <Link
                    to={`/company/${company.company_id}`}
                    key={company.company_id}
                    className="bg-white rounded-2xl p-6 shadow-sm block hover:shadow-lg transition-all"
>
              <div className="w-12 h-12 rounded-xl bg-[#163F68] flex items-center justify-center mb-4">

                <RiBuildingLine
                  className="text-white"
                  size={22}
                />

              </div>

              <h2 className="text-xl font-bold text-[#163F68]">
                {company.company_name}
              </h2>

              <div className="flex items-center gap-2 mt-3 text-gray-500">

                <RiMailLine />

                <span>
                  {company.company_email}
                </span>

              </div>

              <div className="mt-4">

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">

                  {company.subscription_plan}

                </span>

              </div></Link>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}