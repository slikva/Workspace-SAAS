import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function UsersPage() {
  const [showForm, setShowForm] = useState(false);
  const currentUser = JSON.parse(
  localStorage.getItem("user")
  
);
if (currentUser?.role !== "Manager") {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-red-600">
        Access Denied
      </h1>

      <p>
        Only Managers can access User Management.
      </p>
    </div>
  );
}
  const [newUser, setNewUser] = useState({
  company_id: 1,
  full_name: "",
  email: "",
  password: "",
  role: "Employee"
});
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);

 useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/users`
  );

  const data = await res.json();

  setUsers([...data]);

};

const handleAddUser = async () => {

  try {

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      alert(data.message || "Failed to Create User");
      return;

    }

    await fetchUsers();

    setShowForm(false);

    setNewUser({
      company_id: 1,
      full_name: "",
      email: "",
      password: "",
      role: "Employee",
    });

    alert("User Created Successfully");

  } catch (err) {

    console.error(err);

    alert("Failed to Create User");

  }

};
 const handleUpdateUser = async () => {
  try {

    await fetch(
      `${import.meta.env.VITE_API_URL}/users/${editingUser.user_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: editingUser.full_name,
          email: editingUser.email,
          role: editingUser.role,
        }),
      }
    );

    setEditingUser(null);

    fetchUsers();

  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">

      <Sidebar />

      <div className="flex-1 p-8">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-3xl font-bold text-[#163F68]">
              Users Management
            </h1>

            <p className="text-gray-500">
              Manage users in your company
            </p>
          </div>

          {currentUser.role === "Manager" && (
  <button
    onClick={() => setShowForm(true)}
    className="bg-[#163F68] text-white px-5 py-3 rounded-xl"
  >
    + Add User
  </button>
)}

        </div>
        {showForm && (

        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">

          <h2 className="text-xl font-bold mb-4">
            Create User
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Full Name"
              className="border p-3 rounded-xl"
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  full_name: e.target.value
                })
              }
            />

            <input
              type="email"
              placeholder="Email"
              className="border p-3 rounded-xl"
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  email: e.target.value
                })
              }
            />

            <input
              type="password"
              placeholder="Password"
              className="border p-3 rounded-xl"
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  password: e.target.value
                })
              }
            />

            <select
              className="border p-3 rounded-xl"
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  role: e.target.value
                })
              }
            >
              <option>Employee</option>
              <option>Manager</option>
            </select>

          </div>

          <button onClick={handleAddUser} className="mt-4 bg-green-600 text-white px-5 py-3 rounded-xl">
            Save User
          </button>

        </div>

        )}
          {editingUser && (

<div className="bg-white p-6 rounded-2xl shadow-sm mb-6">

  <h2 className="text-xl font-bold mb-4">
    Edit User
  </h2>

  <div className="grid md:grid-cols-2 gap-4">

    <input
      value={editingUser.full_name}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          full_name: e.target.value
        })
      }
      className="border p-3 rounded-xl"
    />

    <input
      value={editingUser.email}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          email: e.target.value
        })
      }
      className="border p-3 rounded-xl"
    />

    <select
      value={editingUser.role}
      onChange={(e) =>
        setEditingUser({
          ...editingUser,
          role: e.target.value
        })
      }
      className="border p-3 rounded-xl"
    >
      <option>Employee</option>
      <option>Manager</option>
    </select>

  </div>

  <button
    onClick={handleUpdateUser}
    className="mt-4 bg-blue-600 text-white px-5 py-3 rounded-xl"
  >
    Update User
  </button>

</div>

)}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          <table className="w-full">

            <thead className="bg-[#163F68] text-white">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>

              {users.map((user) => (

                <tr
                  key={user.user_id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4">
                    {user.user_id}
                  </td>

                  <td className="p-4">
                    {user.full_name}
                  </td>

                  <td className="p-4">
                    {user.email}
                  </td>

                  <td className="p-4 ">
                    {user.role}
                  </td>
                 <td className="p-4">
                  {currentUser.role === "Manager" && (
                    <>
                      <button
                        onClick={() => setEditingUser(user)}
                        className="bg-[#163F68] text-white px-3 py-1 rounded-lg mr-2 "
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(user.user_id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg"
                      >
                        Delete
                      </button>
                    </>
                  )}
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