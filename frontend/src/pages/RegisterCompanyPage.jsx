import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterCompanyPage() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    company_name: "",
    company_email: "",
    manager_name: "",
    manager_email: "",
    password: "",
    subscription_plan: "Basic"
  });

  const handleRegister = async () => {

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/register-company`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify(form)
      }
    );

    const data = await res.json();

    if (data.success) {

      alert(
        "Company Registered Successfully"
      );

      navigate("/login");

    }
  };

  return (
    
    <div className="min-h-screen bg-[#F7F8FA] flex justify-center items-center">
        
      <div className="bg-white p-8 rounded-3xl shadow-lg w-[700px]">
        
        <h1 className="text-4xl font-bold text-[#163F68] mb-2">
          Register Company
        </h1>

        <p className="text-gray-500 mb-8">
          Start using WorkSpace
        </p>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            placeholder="Company Name"
            className="border p-3 rounded-xl"
            onChange={(e) =>
              setForm({
                ...form,
                company_name:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Company Email"
            className="border p-3 rounded-xl"
            onChange={(e) =>
              setForm({
                ...form,
                company_email:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Manager Name"
            className="border p-3 rounded-xl"
            onChange={(e) =>
              setForm({
                ...form,
                manager_name:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Manager Email"
            className="border p-3 rounded-xl"
            onChange={(e) =>
              setForm({
                ...form,
                manager_email:
                  e.target.value
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-xl"
            onChange={(e) =>
              setForm({
                ...form,
                password:
                  e.target.value
              })
            }
          />

          <select
            className="border p-3 rounded-xl"
            onChange={(e) =>
              setForm({
                ...form,
                subscription_plan:
                  e.target.value
              })
            }
          >
            <option>Basic</option>
            <option>Premium</option>
            <option>Enterprise</option>
          </select>

        </div>

        <button
          onClick={handleRegister}
          className="mt-6 bg-[#163F68] text-white px-6 py-3 rounded-xl"
        >
          Register Company
        </button>

      </div>

    </div>
  );
}