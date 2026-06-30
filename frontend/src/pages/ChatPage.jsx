import React, { useEffect,useState,lazy, Suspense,} from "react";
import Sidebar from "../components/Sidebar";
import {
  RiDeleteBin6Line,
  RiThumbUpLine,
  RiEmotionHappyLine,
  RiHeartLine,  RiAttachmentLine,
  RiVolumeMuteLine,
  RiVolumeUpLine,
  RiGroupLine
} from "react-icons/ri";


const EmojiPicker = lazy(() =>
  import("emoji-picker-react")
);
export default function ChatPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeMessage, setActiveMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [reactions, setReactions] = useState({});
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const currentUser = JSON.parse(
  localStorage.getItem("user")
);
  const [newGroup, setNewGroup] = useState("");
  
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
  loadGroups();
  loadUsers();
}, []);
  const loadGroups = async () => {

  let url = `${import.meta.env.VITE_API_URL}/groups`;

  if (currentUser.role === "Employee") {
    url = `${import.meta.env.VITE_API_URL}/my-groups/${currentUser.user_id}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  setGroups(data);

  if (data.length > 0) {
    selectGroup(data[0]);
  }
};
  const loadUsers = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users`);
  const data = await res.json();

  setUsers(data);
};

 const selectGroup = async (group) => {
  setSelectedGroup(group);

  const messagesRes = await fetch(
    `${import.meta.env.VITE_API_URL}/messages/${group.group_id}`
  );

  const messagesData = await messagesRes.json();

  setMessages(messagesData);
  const reactionsObj = {};

for (const msg of messagesData) {

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/reactions/${msg.message_id}`
  );

  const data = await res.json();

  reactionsObj[msg.message_id] = data;
}

setReactions(reactionsObj);

  const membersRes = await fetch(
    `${import.meta.env.VITE_API_URL}/group-members/${group.group_id}`
  );

  const membersData = await membersRes.json();
  console.log("Members:", membersData);

  setMembers(membersData);
};
  const createGroup = async () => {
    if (!newGroup) return;

    await fetch(`${import.meta.env.VITE_API_URL}/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        group_name: newGroup,
        created_by: 1,
      }),
    });

    setNewGroup("");
    loadGroups();
  };

  const sendMessage = async () => {
    if (!message || !selectedGroup) return;

    await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        group_id: selectedGroup.group_id,
        sender_id: currentUser.user_id,
        message,
      }),
    });

    setMessage("");
    selectGroup(selectedGroup);
  };
  const deleteMessage = async (messageId) => {

  await fetch(
    `${import.meta.env.VITE_API_URL}/messages/${messageId}`,
    {
      method: "DELETE",
    }
  );

  selectGroup(selectedGroup);
};
const addReaction = async (
  messageId,
  reaction
) => {

  await fetch(
    `${import.meta.env.VITE_API_URL}/reactions`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        message_id: messageId,
        user_id: currentUser.user_id,
        reaction,
      }),
    }
  );

  selectGroup(selectedGroup);
};
  const handleEmojiClick = (emojiData) => {
  setMessage((prev) => prev + emojiData.emoji);
};
  const addMember = async () => {
  if (!selectedUser || !selectedGroup) return;

  await fetch(`${import.meta.env.VITE_API_URL}/group-members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      group_id: selectedGroup.group_id,
      user_id: selectedUser,
    }),
  });

  selectGroup(selectedGroup);
};
const removeMember = async (userId) => {

  await fetch(
    `${import.meta.env.VITE_API_URL}/group-members/${selectedGroup.group_id}/${userId}`,
    {
      method: "DELETE",
    }
  );

  selectGroup(selectedGroup);
};
const deleteGroup = async (groupId) => {

  const confirmDelete = window.confirm(
    "Delete this group?"
  );

  if (!confirmDelete) return;

  await fetch(
    `${import.meta.env.VITE_API_URL}/groups/${groupId}`,
    {
      method: "DELETE"
    }
  );

  loadGroups();

};
const renameGroup = async (group) => {

  const newName = prompt(
    "Enter new group name",
    group.group_name
  );

  if (!newName) return;

  await fetch(
    `${import.meta.env.VITE_API_URL}/groups/${group.group_id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        group_name: newName
      })
    }
  );

  loadGroups();

};

  return (
    <main className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-1">

       
        <div className="w-72 bg-white border-r">

          <div className="p-4 border-b">

  <h2 className="text-xl font-bold text-[#163F68]">
    Groups
  </h2>

  {currentUser.role === "Manager" && (
    <div className="flex gap-2 mt-3">

      <input
        type="text"
        value={newGroup}
        onChange={(e) => setNewGroup(e.target.value)}
        placeholder="New Group"
        className="border rounded px-3 py-2 flex-1"
      />

      <button
        onClick={createGroup}
        className="bg-[#163F68] hover:bg-[#C99328] text-white px-4 rounded"
      >
        +
      </button>

    </div>
  )}

</div>

         {groups.map((group) => (

  <div
    key={group.group_id}
    className={`flex justify-between items-center p-4 border-b hover:bg-gray-50 ${
      selectedGroup?.group_id === group.group_id
        ? "bg-blue-50"
        : ""
    }`}
  >

    <div
      onClick={() => selectGroup(group)}
      className="flex-1 cursor-pointer"
    >
      {group.group_name}
    </div>

    {currentUser.role === "Manager" && (

      <button
        onClick={() =>
          deleteGroup(group.group_id)
        }
        className="text-red-500 hover:text-red-700"
      >
        ✕
      </button>

    )}

  </div>

))}
        </div>

       
       <div className="flex flex-col h-screen flex-1">
         <div className="bg-gray-50 p-3 border-b">
          <div className="flex justify-between items-center mb-3">

  <h2 className="text-xl font-bold text-[#163F68]">
    {selectedGroup?.group_name || "Chat"}
  </h2>

  <div className="flex gap-3">

    <button
      onClick={() => setShowMembers(!showMembers)}
      className="text-xl"
    >
      <RiGroupLine />
    </button>

    <button
      onClick={() => setIsMuted(!isMuted)}
      className="text-xl"
    >
      {isMuted ? <RiVolumeMuteLine /> : <RiVolumeUpLine />}
    </button>

  </div>

</div>
{currentUser.role === "Manager" && (

<div className="flex gap-2 mb-3">
  <label
    htmlFor="groupSelect"
    className="sr-only"
>
    Select Group
</label>

<select
    id="groupSelect"
    aria-label="Select Group"
    className="border px-3 py-2 rounded"

  
    value={selectedUser}
    onChange={(e) => setSelectedUser(e.target.value)}
   
  >
    <option value="">Select User</option>

    {users.map((user) => (
      <option
        key={user.user_id}
        value={user.user_id}
      >
        {user.full_name}
      </option>
    ))}
  </select>

  <button
    onClick={addMember}
    className="bg-[#163F68] hover:bg-[#C99328] text-white px-4 rounded"
  >
    Add Member
  </button>

</div>

)}

  {showMembers && (

  <div className="bg-white rounded-xl shadow-md p-4 mb-4">

    <h3 className="font-bold mb-3">
      Group Members
    </h3>

    <div className="text-gray-700 text-sm">

      {members.map((member, index) => (
        <React.Fragment key={member.user_id}>

          <span>{member.full_name}</span>

          {currentUser.role === "Manager" && (
            <button
              onClick={() => removeMember(member.user_id)}
              className="text-red-600 font-bold mx-1"
            >
              ×
            </button>
          )}

          {index !== members.length - 1 && ", "}

        </React.Fragment>
      ))}

    </div>

  </div>

)}

</div>

          <div className="flex-1 overflow-y-auto p-4">

           {messages.map((msg) => (

  <div
    key={msg.message_id}
    className={`mb-4 flex ${
      msg.sender_id === currentUser.user_id
        ? "justify-end"
        : "justify-start"
    }`}
  >

    <div
      className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
        msg.sender_id === currentUser.user_id
          ? "bg-[#163F68] text-white"
          : "bg-white"
      }`}
    >

      <div className="flex justify-between items-center mb-1">

  <span className="text-xs text-rgb[250,250,250]">
    {msg.full_name}
  </span>

  <span className="text-[10px] text-rgb[250,250,250]">
    {new Date(msg.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })}
  </span>

</div>

      <div className="flex items-center gap-3">

  <div
  className="relative inline-block"
  onClick={() =>
    setActiveMessage(
      activeMessage === msg.message_id
        ? null
        : msg.message_id
    )
  }
>
  <div>
    {msg.message}
  </div>
  <div className="flex gap-2 mt-1">

  {reactions[msg.message_id]?.map(
    (r) => (
      <span
        key={r.reaction_id}
        className="
        text-xs
        bg-gray-200
        px-2
        rounded-full
        "
      >
        {r.reaction}
      </span>
    )
  )}

</div>

  {/* Hover Toolbar */}

 {activeMessage === msg.message_id && (

  <div
    className="
    absolute
    -top-12
    right-0
    z-50
    bg-rgb(250,250,250)
    shadow-lg
    rounded-lg
    px-3
    py-2
    flex
    gap-3
    border
    "
  >

   <button
  onClick={() =>
    addReaction(
      msg.message_id,
      "😀"
    )
  }
>
  <RiEmotionHappyLine size={18} />
</button>

    <button
  onClick={() =>
    addReaction(
      msg.message_id,
      "👍"
    )
  }
>
  <RiThumbUpLine size={18} />
</button>

    <button
  onClick={() =>
    addReaction(
      msg.message_id,
      "❤️"
    )
  }
>
  <RiHeartLine size={18} />
</button>

    {msg.sender_id === currentUser.user_id && (

      <button
        onClick={() =>
          deleteMessage(msg.message_id)
        }
        className="text-black hover:text-red-600"
      >
        <RiDeleteBin6Line size={18} />
      </button>

    )}

  </div>

)}
</div>
  

</div>
    </div>

  </div>

))}

          </div>

         <div className="sticky bottom-0 bg-white border-t p-4 z-20">

        {showEmoji && (
          <Suspense fallback={<div>Loading emojis...</div>}>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
            />
          </Suspense>
        )}
        <input
          type="file"
          id="fileUpload"
          hidden
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
          <div className="flex gap-3">

            <button
              type="button"
              aria-label="Open emoji picker"
              title="Open emoji picker"
              onClick={() =>
                setShowEmoji(!showEmoji)
              }
              className="text-2xl"
            >
              <RiEmotionHappyLine size={30} />
            </button>
            <button
              type="button"
              onClick={() =>
                document.getElementById("fileUpload").click()
              }
              className="text-2xl"
            >
              <RiAttachmentLine size={30} />
            </button>

            <input
              type="text"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Type message..."
              className="border rounded px-4 py-2 flex-1"
            />

            <button
              onClick={sendMessage}
              className="bg-[#163F68] text-white px-6 py-2 rounded"
            >
              Send
            </button>

  </div>
  {selectedFile && (
  <p className="text-sm text-gray-500 mt-2">
    Selected File: {selectedFile.name}
  </p>
)}

</div>

        </div>

      </div>
    </main>
  );
}