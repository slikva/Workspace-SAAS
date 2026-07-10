import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import {
    RiVideoLine,
    RiCalendarEventLine,
    RiTimeLine,
    RiPlayCircleFill,
    RiLoader4Line,
    RiSearchLine,
    RiAddLine,
    RiArrowRightLine,
    RiHistoryLine,
    RiPhoneLine,
    RiCalendarLine
} from "react-icons/ri";

const API = import.meta.env.VITE_API_URL;

export default function MeetPage() {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const [meetings, setMeetings] = useState([]);
    const [currentView, setCurrentView] = useState("UPCOMING");
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [users, setUsers] = useState([]);
    const [searchEmployee, setSearchEmployee] = useState("");
    const [connectingMeeting, setConnectingMeeting] = useState(false);

    async function loadMeetings() {
        try {
            const res = await fetch(`${API}/meetings/${currentUser.user_id}/${currentUser.role}`);
            const data = await res.json();
            setMeetings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function loadUsers() {
        try {
            const res = await fetch(`${API}/users`);
            const data = await res.json();
            const filteredUsers = data.filter(user => user.user_id !== currentUser.user_id);
            setUsers(filteredUsers);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadMeetings();
        loadUsers();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    function formatDate(date) {
        return new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    }

    function formatTime(time) {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
    }

    function getMeetingDateTime(meeting) {
        const date = new Date(meeting.meeting_date);
        const [hours, minutes] = meeting.meeting_time.split(":").map(Number);
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    function getMeetingStatus(meeting) {
        const now = currentTime;
        const start = getMeetingDateTime(meeting);
        const end = new Date(start);
        end.setHours(end.getHours() + 1);
        if (now < start) return "Upcoming";
        if (now >= start && now <= end) return "Live";
        return "Completed";
    }

   
    const joinMeeting = async (meeting) => {
        setConnectingMeeting(true);
        try {
           const roomName = meeting.room_name;
           console.log("Meeting object:", meeting);

console.log("roomName:", roomName);

console.log("participantName:", currentUser.full_name);
            const response = await axios.post(`${API}/livekit/token`, {
                roomName: roomName,
                participantName: currentUser.full_name,
            });

            const { token, url } = response.data;
            
            
            const targetUrl = `/meeting-room?room=${encodeURIComponent(roomName)}&title=${encodeURIComponent(meeting.title)}`;
            window.open(targetUrl, "_blank", "noopener,noreferrer");

        } catch (err) {
            console.error(err);
            alert("Unable to generate meeting token context safely.");
        } finally {
            setConnectingMeeting(false);
        }
    };
    const startCall = async (user) => {

    setConnectingMeeting(true);

    try {

       
        const roomName = `call-${currentUser.user_id}-${user.user_id}-${Date.now()}`;

        const response = await axios.post(
            `${API}/livekit/token`,
            {
                roomName,
                participantName: currentUser.full_name,
            }
        );

        const { token, url } = response.data;
        const targetUrl =
            `/meeting-room?` +
            `token=${encodeURIComponent(token)}` +
            `&url=${encodeURIComponent(url)}` +
            `&title=${encodeURIComponent(`Call with ${user.full_name}`)}`;

        window.open(
            targetUrl,
            "_blank",
            "noopener,noreferrer"
        );

    } catch (err) {

        console.error(err);

        alert("Unable to start the video call.");

    } finally {

        setConnectingMeeting(false);

    }

};
    const meetMenus = [
        { id: "UPCOMING", label: "Upcoming", icon: RiCalendarEventLine },
        { id: "CALLS", label: "Calls", icon: RiVideoLine },
        { id: "JOIN", label: "Join", icon: RiPlayCircleFill },
        { id: "HISTORY", label: "History", icon: RiTimeLine }
    ];

    return (
        <div className="flex min-h-screen bg-[#F7F8FA]">
            <Sidebar />
            <div className="flex-1 flex overflow-hidden">
                <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
                    {currentUser?.role === "Manager" && (
                    <div className="p-6 border-b">
                        <h2 className="text-3xl font-bold text-[#163F68]">Workspace Meet</h2>
                        <a href="/calendar"> <button className="mt-6 w-full bg-[#163F68] hover:bg-[#C99328] transition text-white rounded-2xl py-3 font-semibold flex justify-center items-center gap-3">
                          <RiAddLine size={20}/> New Meeting
                        </button></a>
                    </div>)}
                    <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {meetMenus.map((menu) => {
                            const Icon = menu.icon;
                            return (
                                <button
                                    key={menu.id}
                                    onClick={() => setCurrentView(menu.id)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition ${currentView === menu.id ? "bg-[#E8F0FE] text-[#163F68] font-semibold"
                        : "hover:bg-slate-100 text-slate-700"}`}
                                >
                                    <Icon size={21}/>
                                    <span className="font-normal">{menu.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="bg-white border-b border-slate-200 px-10 py-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-[#163F68]">Meet</h1>
                            <p className="text-slate-500 mt-1">Collaborate and communicate with your team seamlessly.</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        {connectingMeeting && (
                            <div className="flex flex-col justify-center items-center h-[50vh]">
                                <RiLoader4Line size={45} className="animate-spin text-[#163F68] mb-4"/>
                                <p className="text-slate-600">Initializing workspace room token...</p>
                            </div>
                        )}

                        {!connectingMeeting && currentView === "UPCOMING" && (
                            <>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-3xl font-bold text-[#163F68]">Scheduled Meetings</h2>
                                </div>
                                {loading ? (
                                    <div className="flex justify-center items-center h-[30vh]"><RiLoader4Line size={45} className="animate-spin text-[#163F68]"/></div>
                                ) : (
                                    <div className="grid xl:grid-cols-2 2xl:grid-cols-3 gap-7">
                                        {meetings.filter(m => getMeetingStatus(m) !== "Completed").map(meeting => (
                                            <div key={meeting.meeting_id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                                <div className="bg-[#163F68] px-6 py-5 flex justify-between items-center">
                                                    <h2 className="text-xl font-bold text-white truncate">{meeting.title}</h2>
                                                    <span className="bg-white text-[#163F68] px-3 py-1 rounded-full text-xs font-bold">{getMeetingStatus(meeting)}</span>
                                                </div>
                                                <div className="p-6 space-y-4">
                                                    <div className="text-sm text-slate-600">{formatDate(meeting.meeting_date)} at {formatTime(meeting.meeting_time)}</div>
                                                    <button onClick={() => joinMeeting(meeting)} className="w-full bg-[#163F68] hover:bg-[#C99328] text-white rounded-xl py-3 font-semibold transition">Join Call </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        {currentView==="CALLS" && (
<>
<div className="flex items-center justify-between mb-8">

    <div>

        <h2 className="text-3xl font-bold text-[#163F68]">
            Calls
        </h2>

        <p className="text-slate-500 mt-2">
            Start instant video calls with your team.
        </p>

    </div>

    <div className="relative w-80">

        <RiSearchLine
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
        />

        <input
            type="text"
            placeholder="Search employee..."
            value={searchEmployee}
            onChange={(e)=>setSearchEmployee(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-[#163F68]"
        />

    </div>

</div>

<div className="grid xl:grid-cols-2 2xl:grid-cols-3 gap-7">

{

users

.filter(user=>

user.full_name

.toLowerCase()

.includes(searchEmployee.toLowerCase())

)

.map(user=>(

<motion.div

key={user.user_id}

initial={{opacity:0,y:20}}

animate={{opacity:1,y:0}}

whileHover={{y:-6}}

className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"

>

<div className=" px-6 py-5 flex items-center gap-4">

<div className="w-16 h-16 rounded-full bg-slate-200 text-[#163F68] flex items-center justify-center text-2xl font-bold">

{user.full_name.charAt(0)}

</div>

<div>

<h2 className="text-xl font-bold text-[#163F68]">

{user.full_name}

</h2>

<p className="text-[#163F68]/80 text-sm">

{user.email}

</p>

</div>

</div>

<div className="p-6">

<div className="space-y-4">

<div className="flex justify-between">

<p className="text-slate-500">

Role

</p>

<p className="font-semibold">

{user.role}

</p>

</div>



</div>

<button

onClick={()=>startCall(user)}

className="mt-8 w-full bg-[#163F68] hover:bg-[#C99328] transition text-white rounded-2xl py-3 font-semibold flex justify-center items-center gap-3"

>

<RiVideoLine size={20}/>

Start Video Call

</button>

</div>

</motion.div>

))

}

</div>

</>
)}
{currentView === "JOIN" && (
    <>
        <div className="flex items-center justify-between mb-8">

            <div>
                <h2 className="text-3xl font-bold text-[#163F68]">
                    Join Meeting
                </h2>

                <p className="text-slate-500 mt-2">
                    Join any scheduled Workspace meeting.
                </p>
            </div>

            <div className="text-sm text-slate-500">
                {meetings.length} Meeting(s)
            </div>

        </div>

        {meetings.filter(m => getMeetingStatus(m) !== "Completed").length === 0 ? (

            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">

                <RiVideoLine
                    size={60}
                    className="mx-auto text-slate-300 mb-4"
                />

                <h3 className="text-2xl font-bold text-slate-700">
                    No Meetings Available
                </h3>

                <p className="text-slate-500 mt-2">
                    There are no meetings available to join.
                </p>

            </div>

        ) : (

            <div className="grid xl:grid-cols-2 2xl:grid-cols-3 gap-7">

                {meetings
                    .filter(m => getMeetingStatus(m) !== "Completed")
                    .map(meeting => (

                        <motion.div
                            key={meeting.meeting_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
                        >

                            <div className="bg-[#163F68] px-6 py-5 flex justify-between items-center">

                                <div>

                                    <h2 className="text-xl font-bold text-white">
                                        {meeting.title}
                                    </h2>

                                    <p className="text-white/70 text-sm">
                                        Workspace Meet
                                    </p>

                                </div>

                                <span className="bg-slate-200 text-[#163F68] px-3 py-1 rounded-full text-xs font-bold">
                                    {getMeetingStatus(meeting)}
                                </span>

                            </div>

                            <div className="p-6 space-y-3">

                                <p className="text-slate-600">
                                    <RiCalendarLine /> {formatDate(meeting.meeting_date)}
                                </p>

                                <p className="text-slate-600">
                                    <RiTimeLine /> {formatTime(meeting.meeting_time)}
                                </p>

                                <button
                                    onClick={() => joinMeeting(meeting)}
                                    className="mt-4 w-full bg-[#163F68] hover:bg-[#C99328] text-white rounded-2xl py-3 font-semibold transition"
                                >
                                    Join Workspace Meet
                                </button>

                            </div>

                        </motion.div>

                    ))}

            </div>

        )}
    </>
)}
{currentView === "HISTORY" && (
    <>
        <div className="flex items-center justify-between mb-8">

            <div>

                <h2 className="text-3xl font-bold text-[#163F68]">
                    Meeting History
                </h2>

                <p className="text-slate-500 mt-2">
                    Previously completed meetings.
                </p>

            </div>

        </div>

        {meetings.filter(m => getMeetingStatus(m) === "Completed").length === 0 ? (

            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">

                <RiHistoryLine
                    size={60}
                    className="mx-auto text-slate-300 mb-4"
                />

                <h3 className="text-2xl font-bold text-slate-700">
                    No History
                </h3>

                <p className="text-slate-500 mt-2">
                    Completed meetings will appear here.
                </p>

            </div>

        ) : (

            <div className="space-y-5">

                {meetings
                    .filter(m => getMeetingStatus(m) === "Completed")
                    .map(meeting => (

                        <motion.div
                            key={meeting.meeting_id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-3xl border border-slate-200 p-6 flex justify-between items-center"
                        >

                            <div>

                                <h3 className="text-xl font-bold text-[#163F68]">
                                    {meeting.title}
                                </h3>

                                <p className="text-slate-500 mt-2">
                                    {formatDate(meeting.meeting_date)}
                                </p>

                                <p className="text-slate-500">
                                    {formatTime(meeting.meeting_time)}
                                </p>

                            </div>

                            <div className="bg-slate-100 text-slate-600 px-5 py-2 rounded-full font-semibold">
                                Completed
                            </div>

                        </motion.div>

                    ))}

            </div>

        )}
    </>
)}
                        {/* Other sub-panels like CALLS, JOIN, HISTORY can follow regular patterns */}
                    </div>
                </div>
            </div>
        </div>
    );
}