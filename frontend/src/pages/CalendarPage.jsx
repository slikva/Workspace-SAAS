import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Sidebar from "../components/Sidebar";
import {
  RiCalendarEventLine,
  RiTimeLine
} from "react-icons/ri";

export default function CalendarPage() {

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [showModal, setShowModal] = useState(false);

  const [meetingTitle, setMeetingTitle] =
    useState("");

  const [meetingTime, setMeetingTime] =
    useState("10:00");
    const [meetingType, setMeetingType] = useState("Employee");

const [users, setUsers] = useState([]);

const [groups, setGroups] = useState([]);

const [selectedUser, setSelectedUser] = useState("");

const [selectedGroup, setSelectedGroup] = useState("");

  const [selectedDate, setSelectedDate] =
    useState("");

  const [events, setEvents] = useState([]);

  useEffect(() => {
  fetchMeetings();
  fetchUsers();
  fetchGroups();
}, []);
  const fetchMeetings = async () => {
    try {

     const res = await fetch( `${import.meta.env.VITE_API_URL}/meetings/${currentUser.user_id}/${currentUser.role}`);

      const data = await res.json();

     const formattedEvents = data.map((meeting) => ({

  id: meeting.meeting_id,

  title: meeting.title,

  start: `${meeting.meeting_date}T${meeting.meeting_time}`,

  meeting_date: meeting.meeting_date,

  meeting_time: meeting.meeting_time,

  meeting_type: meeting.meeting_type,

  employee_name: meeting.employee_name,

  group_name: meeting.group_name

}));

      setEvents(formattedEvents);

    } catch (err) {
      console.error(err);
    }
  };
  const fetchUsers = async () => {
  try {

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/users`
    );

    const data = await res.json();

    setUsers(data);

  } catch (err) {
    console.error(err);
  }
};
const fetchGroups = async () => {
  try {

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/groups`
    );

    const data = await res.json();

    setGroups(data);

  } catch (err) {
    console.error(err);
  }
};
  const handleDateClick = (info) => {

    if (
      currentUser.role !== "Manager"
    ) {
      return;
    }

    setSelectedDate(info.dateStr);

    setShowModal(true);
  };

  const saveMeeting = async () => {

  if (!meetingTitle) {
    alert("Enter Meeting Title");
    return;
  }

  if (meetingType === "Employee" && !selectedUser) {
    alert("Please select an employee");
    return;
  }

  if (meetingType === "Group" && !selectedGroup) {
    alert("Please select a group");
    return;
  }

  try {

    await fetch(
      `${import.meta.env.VITE_API_URL}/meetings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

       body: JSON.stringify({

  title: meetingTitle,

  description: "",

  meeting_date: selectedDate,

  meeting_time: meetingTime,

  meeting_type: meetingType,

  employee_id:
    meetingType === "Employee"
      ? selectedUser
      : null,

  group_id:
    meetingType === "Group"
      ? selectedGroup
      : null,

  created_by: currentUser.user_id,

}),
      }
    );

    alert("Meeting Scheduled Successfully");

    setShowModal(false);

    setMeetingTitle("");

    

    setMeetingTime("10:00");

    setSelectedUser("");

    setSelectedGroup("");

    setMeetingType("Employee");

    fetchMeetings();

  } catch (err) {

    console.error(err);

    alert("Failed to Schedule Meeting");

  }

};
const deleteMeeting = async (id) => {

  const confirmDelete = window.confirm(
    "Delete this meeting?"
  );

  if (!confirmDelete) return;

  await fetch(
    `${import.meta.env.VITE_API_URL}/meetings/${id}`,
    {
      method: "DELETE"
    }
  );

  fetchMeetings();

};

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">

      <Sidebar />

      <div className="flex-1 p-8">

        {/* Header */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-[#163F68]">
            Company Calendar
          </h1>

          <p className="text-gray-500 mt-1">
            Manage meetings and schedules
          </p>

        </div>


        {showModal && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-2xl p-6 w-[450px] shadow-2xl">

              <h2 className="text-2xl font-bold text-[#163F68] mb-5">
                Schedule Meeting
              </h2>

              <input
                type="text"
                placeholder="Meeting Title"
                value={meetingTitle}
                onChange={(e) =>
                  setMeetingTitle(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3 mb-4"
              />

              <input
                type="time"
                value={meetingTime}
                onChange={(e) =>
                  setMeetingTime(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3 mb-4"
              />
              <div className="mb-4">

  <label className="font-semibold text-[#163F68]">
    Meeting With
  </label>

  <div className="flex gap-6 mt-2">

    <label className="flex items-center gap-2">

      <input
        type="radio"
        checked={meetingType === "Employee"}
        onChange={() => setMeetingType("Employee")}
      />

      Employee

    </label>

    <label className="flex items-center gap-2">

      <input
        type="radio"
        checked={meetingType === "Group"}
        onChange={() => setMeetingType("Group")}
      />

      Group

    </label>

  </div>

</div>
{meetingType === "Employee" && (

<select
  value={selectedUser}
  onChange={(e) =>
    setSelectedUser(e.target.value)
  }
  className="w-full border rounded-xl p-3 mb-4"
>

  <option value="">
    Select Employee
  </option>

  {users
    .filter(user => user.role === "Employee")
    .map((user) => (

      <option
        key={user.user_id}
        value={user.user_id}
      >

        {user.full_name}

      </option>

    ))}

</select>

)}
{meetingType === "Group" && (

<select
  value={selectedGroup}
  onChange={(e) =>
    setSelectedGroup(e.target.value)
  }
  className="w-full border rounded-xl p-3 mb-4"
>

  <option value="">
    Select Group
  </option>

  {groups.map((group) => (

    <option
      key={group.group_id}
      value={group.group_id}
    >

      {group.group_name}

    </option>

  ))}

</select>

)}

              <div className="bg-gray-100 rounded-xl p-3 mb-5">

                <p className="text-sm text-gray-600">
                  Meeting Date
                </p>

                <p className="font-semibold text-[#163F68]">
                  {selectedDate}
                </p>

              </div>

              <div className="flex gap-3">

                <button
                  onClick={saveMeeting}
                  className="flex-1 bg-[#163F68] text-white py-3 rounded-xl hover:bg-[#102D49]"
                >
                  Save Meeting
                </button>

                <button
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="flex-1 bg-gray-200 py-3 rounded-xl"
                >
                  Cancel
                </button>
                

              </div>

            </div>

          </div>

        )}


        <div className="grid lg:grid-cols-4 gap-6">



          <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm">

            <FullCalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin
              ]}
              initialView="dayGridMonth"
              dateClick={
                handleDateClick
              }
              events={events}
              eventColor="#163F68"
              eventTextColor="#ffffff"
              height="75vh"
              headerToolbar={{
                left:
                  "prev,next today",
                center: "title",
                right:
                  "dayGridMonth,timeGridWeek,timeGridDay"
              }}
            />

          </div>


          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <h3 className="text-xl font-bold text-[#163F68] mb-5">
              Upcoming Meetings
            </h3>

            <div className="space-y-4 max-h-[75vh] overflow-y-auto">

              {events.length === 0 ? (

                <div className="text-gray-500 text-sm">
                  No Meetings Scheduled
                </div>

              ) : (

                events.map((event) => (

                  <div
                    key={event.id}
                    className="border-l-4 border-[#C99232] bg-gray-50 p-4 rounded-lg"
                  >

                    <h4 className="font-semibold text-[#163F68]">
                      {event.title}
                    </h4>
<div className="mt-3 text-sm text-gray-600">

  {event.meeting_type === "Employee" ? (

    <p>
       {event.employee_name}
    </p>

  ) : (

    <p>
       {event.group_name}
    </p>

  )}

</div>
                   
  

  <div className="mt-3 text-sm space-y-2">

    <div className="flex items-center gap-2 text-gray-600">
      <RiCalendarEventLine
        className="text-[#C99232]"
      />
      {new Date(event.meeting_date).toLocaleDateString()}
    </div>

    <div className="flex items-center gap-2 text-gray-600">
      <RiTimeLine
        className="text-[#163F68]"
      />
      {event.meeting_time}
    </div>

  </div>
  {currentUser.role === "Manager" && (

<button

onClick={() => deleteMeeting(event.id)}

className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"

>

Delete Meeting

</button>

)}



                  </div>

                ))

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}