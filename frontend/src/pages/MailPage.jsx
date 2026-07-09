import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Sidebar from "../components/Sidebar";
import EmojiPicker from "emoji-picker-react";
import {
    RiInboxLine,
    RiStarLine,
    RiStarFill,
    RiSendPlaneLine,
    RiDraftLine,
    RiArchiveLine,
    RiDeleteBin6Line,
    RiReplyLine,
    RiShareForwardLine,
    RiSearchLine,
    RiRefreshLine,
    RiEditBoxLine,
    RiArrowLeftLine,
    RiSendPlane2Fill,
    RiCloseLine,
    RiEmotionHappyLine,
    RiArrowGoBackLine,
    RiArrowGoForwardLine,
    RiAttachment2,
    RiCloseCircleLine,
    RiFilePdf2Line,
    RiFileWord2Line,
    RiFileZipLine,
    RiPriceTag3Line,
    RiSpam2Line,
    RiImage2Line
} from "react-icons/ri";

export default function MailPage() {

    
    const [selectedFolder, setSelectedFolder] = useState("INBOX");

    const [emails, setEmails] = useState([]);

    const [selectedMail, setSelectedMail] = useState(null);
    const [counts, setCounts] = useState({
    inbox: 0,
    starred: 0,
    important: 0,
    sent: 0,
    drafts: 0,
    archive: 0,
    spam: 0,
    trash: 0
});

    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("ALL");
    
    const quillRef = useRef(null);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [attachments, setAttachments] = useState([]);
    
    const [currentView, setCurrentView] = useState("LIST");

    const [composeData, setComposeData] = useState({

        to: "",

       
        subject: "",

        body: ""

    });

    

   const folders = [
  {
    id: "INBOX",
    title: "Inbox",
    icon: RiInboxLine,
    count: counts.inbox
},
{
    id: "STARRED",
    title: "Starred",
    icon: RiStarLine,
    count: counts.starred
},
{
    id: "IMPORTANT",
    title: "Important",
    icon: RiPriceTag3Line,
    count: counts.important
},
{
    id: "SENT",
    title: "Sent",
    icon: RiSendPlaneLine,
    count: counts.sent
},
{
    id: "DRAFTS",
    title: "Drafts",
    icon: RiDraftLine,
    count: counts.drafts
},
{
    id: "ARCHIVE",
    title: "Archive",
    icon: RiArchiveLine,
    count: counts.archive
},
{
    id: "SPAM",
    title: "Spam",
    icon: RiSpam2Line,
    count: counts.spam
},
{
    id: "TRASH",
    title: "Trash",
    icon: RiDeleteBin6Line,
    count: counts.trash
},
];
   

    const API = import.meta.env.VITE_API_URL;
    

async function loadFolder(folder = selectedFolder) {

    try {

        setLoading(true);

        const response = await fetch(

            `${API}/gmail/${folder.toLowerCase()}`

        );

        const data = await response.json();

        setEmails(data);

        setSelectedMail(null);

        setCurrentView("LIST");

    } catch (err) {

        console.error(err);

    } finally {

        setLoading(false);

    }

}
async function loadCounts() {

    try {

        const response = await fetch(`${API}/gmail/counts`);

        const data = await response.json();

        setCounts(data);

    } catch (err) {

        console.error(err);

    }

}


useEffect(() => {

    loadFolder(selectedFolder);

    loadCounts();

}, [selectedFolder]);

const filteredEmails = emails.filter((mail) => {

    const value = search.toLowerCase();

    const searchMatch =

        (mail.from || "").toLowerCase().includes(value) ||

        (mail.subject || "").toLowerCase().includes(value) ||

        (mail.snippet || "").toLowerCase().includes(value);

    if (!searchMatch) return false;

    switch (filter) {

        case "STARRED":
            return mail.labels?.includes("STARRED");

        case "IMPORTANT":
            return mail.labels?.includes("IMPORTANT");

        case "ATTACHMENTS":
            return mail.payload?.parts?.some(
                part => part.filename
            );

        default:
            return true;

    }

});



const formatDate = (date) => {

    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {

        day: "numeric",

        month: "short",

        year: "numeric",

        hour: "numeric",

        minute: "2-digit"

    });

};
function formatFileSize(bytes) {

    if (!bytes) return "";

    if (bytes < 1024)
        return bytes + " B";

    if (bytes < 1024 * 1024)
        return (bytes / 1024).toFixed(1) + " KB";

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";

}


function openMail(mail) {

    setSelectedMail(mail);

    setCurrentView("PREVIEW");

}


function composeMail() {

    setComposeData({

        to: "",


        subject: "",

        body: ""

    });

    setCurrentView("COMPOSE");

}



async function sendMail() {

    try {
        const formData = new FormData();

        formData.append("to", composeData.to);

        formData.append("subject", composeData.subject);

        formData.append("body", composeData.body);

        attachments.forEach(file => {

            formData.append("attachments", file);

        });
        const response = await fetch(

            `${API}/gmail/send`,

            {

                method: "POST",
               body: formData

            }

        );

        const data = await response.json();

        if (data.success) {

            alert("Email Sent Successfully");

           setCurrentView("LIST");

          setComposeData({
              to: "",
             
              subject: "",
              body: ""
          });
            setAttachments([]);
            loadFolder(selectedFolder);

        }

    } catch (err) {

        console.error(err);

    }

}



async function archiveMail() {

    if (!selectedMail) return;

    try {

        await fetch(

            `${API}/gmail/archive`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    messageId: selectedMail.id

                })

            }

        );

        loadFolder(selectedFolder);

    } catch (err) {

        console.error(err);

    }

}



async function trashMail() {

    if (!selectedMail) return;

    try {

        const response = await fetch(

            `${API}/gmail/trash`,

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    messageId:selectedMail.id

                })

            }

        );

        const data = await response.json();

        console.log(data);

        if(data.success){

            setSelectedMail(null);

            setCurrentView("LIST");

            loadFolder(selectedFolder);

        }

    }

    catch(err){

        console.error(err);

    }

}

async function toggleStar(mail) {

    try {

        const endpoint = mail.starred ? "unstar" : "star";

        const response = await fetch(

            `${API}/gmail/${endpoint}`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    messageId: mail.id

                })

            }

        );

        const data = await response.json();

        if (data.success) {

            const updatedStar = !mail.starred;

           
            setSelectedMail({

                ...mail,

                starred: updatedStar

            });

            
            setEmails(prev =>

                prev.map(email =>

                    email.id === mail.id

                        ? {

                              ...email,

                              starred: updatedStar

                          }

                        : email

                )

            );

           
            if (selectedFolder === "STARRED" && !updatedStar) {

                loadFolder("STARRED");

            }

        }

    } catch (err) {

        console.error(err);

    }

}

function replyMail() {

    if (!selectedMail) return;

    const temp = document.createElement("div");
    temp.innerHTML = selectedMail.body || "";

    const plainText = temp.innerText;

    setComposeData({

        to: selectedMail.from,

        cc: "",

        bcc: "",

        subject: `Re: ${selectedMail.subject}`,

        body:
`\n\n--------------------------------------------

${plainText}`

    });

    setCurrentView("COMPOSE");

}
function forwardMail() {

    if (!selectedMail) return;

    const temp = document.createElement("div");
    temp.innerHTML = selectedMail.body || "";

    const plainText = temp.innerText;

    setComposeData({

        to: "",

        cc: "",

        bcc: "",

        subject: `Fwd: ${selectedMail.subject}`,

        body:
`\n\n--------------------------------------------

${plainText}`

    });

    setCurrentView("COMPOSE");

}
const quillModules = {
  toolbar: [
    ["undo", "redo"],

    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],

    ["bold", "italic", "underline"],

    [{ color: [] }, { background: [] }],

    [{ align: [] }],

    [{ list: "ordered" }, { list: "bullet" }],

    [{ indent: "-1" }, { indent: "+1" }],

    ["link"],

    ["clean"]
  ]
};

const quillFormats = [
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "color",
  "background",
  "align",
  "list",
  "bullet",
  "indent",
  "link"
];
const modules = {

    toolbar: [

        [{ font: [] }],

        [{ header: [1, 2, 3, false] }],

        ["bold", "italic", "underline"],

        [{ color: [] }],

        [{ align: [] }],

        [{ list: "ordered" }, { list: "bullet" }],

        ["link"],

        ["clean"]

    ],

    history: {

        delay: 1000,

        maxStack: 100,

        userOnly: true

    }

};
const formats = [

    "font",

    "header",

    "bold",

    "italic",

    "underline",

    "color",

    "align",

    "list",

    "bullet",

    "link"

];
function addEmoji(emojiData) {

    const editor = quillRef.current.getEditor();

    const range = editor.getSelection(true);

    editor.insertText(
        range.index,
        emojiData.emoji
    );

    editor.setSelection(
        range.index + emojiData.emoji.length
    );

    setShowEmojiPicker(false);

}

function handleAttachment(e) {

    const files = Array.from(e.target.files);

    setAttachments(prev => [...prev, ...files]);

}
function removeAttachment(index) {

    setAttachments(

        attachments.filter((_, i) => i !== index)

    );

}
function undoEditor() {

    const editor = quillRef.current?.getEditor();

    if (!editor) return;

    editor.history.undo();

}
function redoEditor() {

    const editor = quillRef.current?.getEditor();

    if (!editor) return;

    editor.history.redo();

}
return (

<div className="flex h-screen bg-slate-100 overflow-hidden">


    <Sidebar />

    
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col">

       

        <div className="p-5">

            <button

                onClick={composeMail}

                className="
                w-full
                bg-[#163F68]
                text-white
                rounded-xl
                py-3
                flex
                items-center
                justify-center
                gap-2
                font-semibold
                hover:bg-[#C99328]
                transition
                "

            >

                <RiEditBoxLine size={20} />

                Compose

            </button>

        </div>

       

        <div className="px-5 pb-2">

            <p className="text-xs uppercase tracking-wider text-slate-400">

                Mailbox

            </p>

        </div>

       

        <div className="px-3 flex-1 overflow-y-auto">

          {folders.map((folder) => {

    const Icon = folder.icon;

    return (

        <button
            key={folder.id}
            onClick={() => setSelectedFolder(folder.id)}
            className={`
                w-full
                flex
                items-center
                justify-between
                px-4
                py-3
                rounded-xl
                mb-1
                transition
                ${
                    selectedFolder === folder.id
                        ? "bg-[#E8F0FE] text-[#163F68] font-semibold"
                        : "hover:bg-slate-100 text-slate-700"
                }
            `}
        >

            <div className="flex items-center gap-3">

                <Icon size={20} />

                <span>{folder.title}</span>

            </div>

           

        </button>

    );

})}
</div>

    </div>


    <div className="flex-1 bg-white flex flex-col">
<div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">

    <div>

        <h2 className="text-2xl font-bold text-slate-800">

            {
                currentView === "COMPOSE"
                ? "Compose Mail"
                : currentView === "PREVIEW"
                ? "Email"
                : folders.find(f => f.id === selectedFolder)?.title
            }

        </h2>

    </div>

    {
        currentView === "LIST" && (

            <div className="flex items-center gap-3">

                <div className="relative">

                    <RiSearchLine
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />

                    <input

                        type="text"

                        placeholder="Search Mail"

                        value={search}

                        onChange={(e)=>setSearch(e.target.value)}

                        className="
                        pl-10
                        pr-4
                        py-2
                        border
                        rounded-lg
                        outline-none
                        focus:ring-2
                        focus:ring-blue-400
                        "

                    />

                </div>

                <button

                    onClick={()=>loadFolder(selectedFolder)}

                    className="
                    p-2
                    rounded-lg
                    border
                    hover:bg-slate-100
                    "

                >

                    <RiRefreshLine size={20}/>

                </button>

            </div>

        )
    }

</div>



<div className="flex-1 overflow-hidden">

{
currentView === "LIST"

?

(

<div className="h-full overflow-y-auto">

{
loading

?

(

<div className="h-full flex items-center justify-center text-slate-500">

Loading...

</div>

)

:

filteredEmails.length===0

?

(

<div className="h-full flex items-center justify-center text-slate-400">

No Emails Found

</div>

)

:

filteredEmails.map((mail)=>(

<motion.div

key={mail.id}

whileHover={{scale:1.01}}

whileTap={{scale:.99}}

onClick={()=>openMail(mail)}

className="
cursor-pointer
border-b
px-6
py-5
hover:bg-slate-50
transition
"

>

<div className="flex justify-between">

<h3 className="font-semibold truncate">

{mail.subject || "(No Subject)"}

</h3>

<span className="text-xs text-slate-400">

{formatDate(mail.date)}

</span>

</div>

<p className="text-sm mt-2 text-slate-600 truncate">

{mail.from}

</p>

<p className="text-sm mt-2 text-slate-400 line-clamp-2">

{mail.snippet}

</p>

</motion.div>

))

}

</div>

)

:
currentView === "PREVIEW"

?

(

selectedMail && (

<div className="h-full flex flex-col">

    

    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">

        <div className="flex items-center gap-2">

            <button

                onClick={()=>{
                    setCurrentView("LIST");
                    setSelectedMail(null);
                }}

                className="p-2 rounded-lg hover:bg-slate-100"

            >

                <RiArrowLeftLine size={22}/>

            </button>

            <button
                onClick={() => toggleStar(selectedMail)}
                className="p-2 rounded-lg hover:bg-yellow-100"
            >

                {selectedMail?.starred ? (

                    <RiStarFill
                        size={22}
                        className="text-yellow-500"
                    />

                ) : (

                    <RiStarLine
                        size={22}
                        className="text-slate-500"
                    />

                )}

            </button>

            <button

                onClick={archiveMail}

                className="p-2 rounded-lg hover:bg-slate-100"

            >

                <RiArchiveLine size={22}/>

            </button>

            <button

                onClick={trashMail}

                className="p-2 rounded-lg hover:bg-red-100"

            >

                <RiDeleteBin6Line size={22}/>

            </button>

        </div>

        <div className="flex gap-2">

            <button

                onClick={replyMail}

                className="p-2 rounded-lg hover:bg-slate-100"

            >

                <RiReplyLine size={22}/>

            </button>

            <button

                onClick={forwardMail}

                className="p-2 rounded-lg hover:bg-slate-100"

            >

                <RiShareForwardLine size={22}/>

            </button>

        </div>

    </div>

   

    <div className="flex-1 overflow-y-auto p-8">

        <h1 className="text-3xl font-bold text-slate-800">

            {selectedMail.subject || "(No Subject)"}

        </h1>

        <div className="mt-8 space-y-3">

            <p>

                <span className="font-semibold">

                    From :

                </span>

                {" "}

                {selectedMail.from}

            </p>

            <p>

                <span className="font-semibold">

                    To :

                </span>

                {" "}

                {selectedMail.to}

            </p>

            <p>

                <span className="font-semibold">

                    Date :

                </span>

                {" "}

                {formatDate(selectedMail.date)}

            </p>

        </div>

        <hr className="my-8"/>

       <div
    className="prose max-w-none leading-8 text-slate-700"
    dangerouslySetInnerHTML={{
        __html: selectedMail.body || "<p>No Content</p>"
    }}
/>

    </div>

</div>

)

)

:
currentView === "COMPOSE"

?

(

<div className="h-full flex flex-col">

   

    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

            <button

                onClick={() => {

                    setCurrentView("LIST");

                    setComposeData({

                        to: "",

                        subject: "",

                        body: ""

                    });

                }}

                className="p-2 rounded-lg hover:bg-slate-100"

            >

                <RiArrowLeftLine size={22}/>

            </button>

            <h2 className="text-2xl font-bold">

                Compose Mail

            </h2>

        </div>

        <button

            onClick={sendMail}

            className="bg-[#163F68] hover:bg-[#204f79] text-white px-6 py-3 rounded-xl flex items-center gap-2"

        >

            <RiSendPlane2Fill size={18}/>

            Send

        </button>

    </div>

   

    <div className="flex-1 overflow-y-auto p-8 space-y-5">

        <input

            type="email"

            placeholder="To"

            value={composeData.to}

            onChange={(e)=>

                setComposeData({

                    ...composeData,

                    to:e.target.value

                })

            }

            className="w-full border rounded-lg px-4 py-3"

        />

       

        <input

            type="text"

            placeholder="Subject"

            value={composeData.subject}

            onChange={(e)=>

                setComposeData({

                    ...composeData,

                    subject:e.target.value

                })

            }

            className="w-full border rounded-lg px-4 py-3"

        />

          <div className="border rounded-lg overflow-hidden">

   <ReactQuill
    ref={quillRef}
    theme="snow"
    value={composeData.body}
    onChange={(value)=>
        setComposeData({
            ...composeData,
            body:value
        })
    }
    modules={modules}
    formats={formats}
/>

    <div className="border-t bg-white px-4 py-3 flex items-center justify-between">

        <div className="flex items-center gap-4">

   
            <button
                onClick={undoEditor}
                className="hover:text-blue-600"
            >
                <RiArrowGoBackLine size={22}/>
            </button>

            <button
                onClick={redoEditor}
                className="hover:text-blue-600"
            >
                <RiArrowGoForwardLine size={22}/>
            </button>


            <div className="relative">

                <button
                    onClick={()=>
                        setShowEmojiPicker(!showEmojiPicker)
                    }
                    className="hover:text-yellow-500"
                >
                    <RiEmotionHappyLine size={22}/>
                </button>

                {showEmojiPicker && (

                    <div className="absolute bottom-12 left-0 z-50 shadow-xl">

                        <EmojiPicker
                            onEmojiClick={addEmoji}
                        />

                    </div>

                )}

            </div>

   

            <label
                className="cursor-pointer hover:text-blue-600"
            >

                <RiAttachment2 size={22}/>

                <input
                    type="file"
                    multiple
                    hidden
                    onChange={handleAttachment}
                />

            </label>

        </div>

  

       {attachments.length > 0 && (

<div className="mt-4 flex flex-wrap gap-3">

{attachments.map((file,index)=>{

const isImage=file.type.startsWith("image/");

const isPdf=file.type.includes("pdf");

const isWord=file.type.includes("word") ||

file.name.endsWith(".doc") ||

file.name.endsWith(".docx");

const isZip=file.type.includes("zip");

return(

<div

key={index}

className="relative flex items-center gap-3 bg-slate-100 border rounded-xl px-4 py-3 min-w-[240px]"

>

<button

type="button"

onClick={()=>removeAttachment(index)}

className="absolute -top-2 -right-2 bg-white rounded-full shadow"

>

<RiCloseCircleLine

size={20}

className="text-red-500"

/>

</button>

<div>

{

isImage ?

<img

src={URL.createObjectURL(file)}

alt="preview"

className="w-12 h-12 rounded object-cover"

/>

:

isPdf ?

<RiFilePdf2Line

size={42}

className="text-red-600"

/>

:

isWord ?

<RiFileWord2Line

size={42}

className="text-blue-600"

/>

:

isZip ?

<RiFileZipLine

size={42}

className="text-yellow-600"

/>

:

<RiAttachment2

size={42}

className="text-slate-500"

/>

}

</div>

<div className="flex-1">

<p className="font-medium text-sm truncate max-w-[160px]">

{file.name}

</p>

<p className="text-xs text-slate-500">

{formatFileSize(file.size)}

</p>

</div>

</div>

);

})}

</div>

)}

    </div>

</div>
    </div>

</div>

)

:

(

<div className="h-full flex items-center justify-center text-slate-400">

Select an email to view.

</div>

)

}

</div>

</div>

</div>

);

}
