import React, { useState } from "react";
import OwnerSidebar from "../components/ownersidebar";

export default function CreateCompanyPage() {

  const [form, setForm] = useState({
    company_name: "",
    company_email: "",
    subscription_plan: "Basic",
    manager_name: "",
    manager_email: "",
    manager_password: ""
  });

  const handleCreate = async () => {

    const res = await fetch(
      "http://localhost:5001/companies",
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
        "Company Created Successfully"
      );

      setForm({
        company_name: "",
        company_email: "",
        subscription_plan: "Basic",
        manager_name: "",
        manager_email: "",
        manager_password: ""
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">

      <OwnerSidebar />

      <div className="flex-1 p-8">

        <h1 className="text-4xl font-bold text-[#163F68] mb-8">
          Create Company
        </h1>

        <div className="bg-white rounded-3xl p-8 shadow-sm max-w-3xl">

          <div className="grid md:grid-cols-2 gap-5">

            <input
              placeholder="Company Name"
              value={form.company_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  company_name:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              placeholder="Company Email"
              value={form.company_email}
              onChange={(e) =>
                setForm({
                  ...form,
                  company_email:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

            <select
              className="border p-3 rounded-xl"
              value={
                form.subscription_plan
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  subscription_plan:
                    e.target.value
                })
              }
            >
              <option>
                Basic
              </option>

              <option>
                Premium
              </option>

              <option>
                Enterprise
              </option>

            </select>

            <input
              placeholder="Manager Name"
              value={form.manager_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  manager_name:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              placeholder="Manager Email"
              value={form.manager_email}
              onChange={(e) =>
                setForm({
                  ...form,
                  manager_email:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              type="password"
              placeholder="Manager Password"
              value={
                form.manager_password
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  manager_password:
                    e.target.value
                })
              }
              className="border p-3 rounded-xl"
            />

          </div>

          <button
            onClick={handleCreate}
            className="mt-6 bg-[#163F68] text-white px-6 py-3 rounded-xl hover:bg-[#245A90]"
          >
            Create Company
          </button>

        </div>

      </div>

    </div>
  );
}