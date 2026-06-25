import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function TasksPage() {

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const currentUser = JSON.parse(
  localStorage.getItem("user")
);
  const [newTask, setNewTask] = useState({
    assigned_by: 1,
    assigned_to: "",
    title: "",
    description: "",
    status: "Pending",
    priority: "Medium",
    due_date: ""
  });

  const fetchTasks = async () => {

  let url = "http://localhost:5001/tasks";

  if (currentUser.role === "Employee") {
    url = `http://localhost:5001/my-tasks/${currentUser.user_id}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  setTasks(data);
};
  const handleAddTask = async () => {
  try {

    const response = await fetch(
      "http://localhost:5001/tasks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      }
    );

    const data = await response.json();

    if (data.success) {

      alert("Task Created Successfully");

      setNewTask({
        assigned_by: currentUser.user_id,
        assigned_to: "",
        title: "",
        description: "",
        status: "Pending",
        priority: "Medium",
        due_date: ""
      });

      fetchTasks();
    }

  } catch (err) {
    console.error(err);
    alert("Failed to create task");
  }
};

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5001/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);
  const updateStatus = async (taskId, status) => {

  await fetch(
    `http://localhost:5001/tasks/${taskId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  fetchTasks();
};

  return (
    
    <main className="flex min-h-screen bg-[#F7F8FA]">

      <Sidebar />

      <div className="flex-1 p-8">
        {currentUser.role === "Manager" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
    
        <h2 className="text-xl font-bold mb-4">
          Create Task
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
         
         <div>
  <label htmlFor="taskTitle" className="sr-only">
    Task Title
  </label>

  <input
    id="taskTitle"
    type="text"
    placeholder="Task Title"
    className="border p-3 rounded-xl w-full"
    onChange={(e) =>
      setNewTask({
        ...newTask,
        title: e.target.value,
      })
    }
  />
</div>

          <div>
  <label htmlFor="employeeSelect" className="sr-only">
    Select Employee
  </label>

  <select
    id="employeeSelect"
    className="border p-3 rounded-xl w-full"
            onChange={(e) =>
              setNewTask({
                ...newTask,
                assigned_to: e.target.value
              })
            }
          >
            <option value="">
              Select Employee
            </option>

            {users.map((user) => (
              <option
                key={user.user_id}
                value={user.user_id}
              >
                {user.full_name}
              </option>
            ))}
          </select></div>

          <textarea
            placeholder="Task Description"
            className="border p-3 rounded-xl"
            onChange={(e) =>
              setNewTask({
                ...newTask,
                description: e.target.value
              })
            }
          />
      
    <div>
  <label htmlFor="priority" className="sr-only">
    Priority
  </label>

  <select
    id="priority"
    className="border p-3 rounded-xl w-full"
      
      onChange={(e) =>
        setNewTask({
          ...newTask,
          priority: e.target.value
        })
      }
    >
      <option>Low</option>
      <option>Medium</option>
      <option>High</option>
    </select>
      </div>
    <div>
  <label htmlFor="dueDate" className="sr-only">
    Due Date
  </label>

  <input
    id="dueDate"
    type="date"
    className="border p-3 rounded-xl w-full"
     
      onChange={(e) =>
        setNewTask({
          ...newTask,
          due_date: e.target.value
        })
      }
    /></div>

  </div>

  <button onClick={handleAddTask}
    className="mt-4 bg-[#163F68] hover:bg-[#C99328] text-white px-5 py-3 rounded-xl"
  >
    Save Task
  </button>

</div>)}
        <h1 className="text-3xl font-bold text-[#163F68] mb-6">
          Tasks Management
        </h1>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

  <table className="w-full">

    <thead className="bg-[#163F68] text-white">
      <tr>
        <th className="p-4 text-left">Title</th>
        <th className="p-4 text-left">Assigned To</th>
        <th className="p-4 text-left">Priority</th>
        <th className="p-4 text-left">Status</th>
        <th className="p-4 text-left">Due Date</th>
      </tr>
    </thead>

    <tbody>

      {tasks.map((task) => (

        <tr
          key={task.task_id}
          className="border-b hover:bg-gray-50"
        >

          <td className="p-4">
            {task.title}
          </td>

          <td className="p-4">
            {task.employee_name}
          </td>

          <td className="p-4">
            {task.priority}
          </td>

          <td className="p-4">

  {currentUser.role === "Employee" ? (

    <>
  <label htmlFor={`status-${task.task_id}`} className="sr-only">
    Task Status
  </label>

  <select
    id={`status-${task.task_id}`}
    value={task.status}
      onChange={(e) =>
        updateStatus(
          task.task_id,
          e.target.value
        )
      }
      className=" rounded px-2 py-1"
    >
      <option>Pending</option>
      <option>In Progress</option>
      <option>Completed</option>
    </select></>

  ) : (

    <span>{task.status}</span>

  )}

</td>

          <td className="p-4">
            {task.due_date}
          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>
      </div>

    </main>
  );
}