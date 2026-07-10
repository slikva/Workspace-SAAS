import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useTracks,
    useRoomContext,
    useChat,
    VideoTrack,
    AudioTrack,
    useParticipantInfo
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
    RiMicLine,
    RiMicOffLine,
    RiVideoLine,
    RiVideoOffLine,
    RiComputerLine,
    RiPhoneFill,
    RiChat3Line,
    RiSendPlane2Fill,
    RiEmotionLine
} from "react-icons/ri";
const API = import.meta.env.VITE_API_URL;

function CustomParticipantTile({ participantTrack }) {
    const { participant, source, publication } = participantTrack;
    const { identity } = useParticipantInfo({ participant });
    
    const isTrackEnabled = publication ? (publication.isSubscribed && !publication.isMuted) : false;
    const displayName = identity || participant.name || "User";
    const initialLetter = displayName.charAt(0).toUpperCase();

    const isCameraVideo = source === Track.Source.Camera && isTrackEnabled;
    const isScreenShareVideo = source === Track.Source.ScreenShare;

    return (
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800/80 flex items-center justify-center h-full w-full shadow-md aspect-video">

            {isCameraVideo || isScreenShareVideo ? (
                <VideoTrack trackRef={participantTrack} className="w-full h-full object-contain bg-slate-950 rounded-xl" />
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-[#C99232] shadow-xl flex items-center justify-center font-bold text-4xl text-white tracking-wider border border-white/10 uppercase">
                        {initialLetter}
                    </div>
                </div>
            )}

            {source === Track.Source.Microphone && <AudioTrack trackRef={participantTrack} />}

            <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur px-3 py-1 rounded-lg text-xs font-semibold text-slate-200 border border-slate-800/50 max-w-[85%] truncate z-10">
                {source === Track.Source.ScreenShare 
                    ? `${displayName}'s Presentation` 
                    : `${displayName} ${participant.isLocal ? "(You)" : ""}`
                }
            </div>
        </div>
    );
}


function ActiveVideoGrid({ isChatOpen, floatingEmojis }) {
    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false }
    ]);

    return (
        <div className="flex-1 p-6 bg-slate-950 transition-all duration-300 h-[calc(100vh-96px)] flex items-center justify-center relative">
            
         
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                {floatingEmojis.map((item) => (
                    <div
                        key={item.id}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-[bounceUp_2s_ease-out_forwards]"
                        style={{
                            left: `${40 + Math.random() * 20}%`, // Distribute across the middle section
                        }}
                    >
                        <div className="text-4xl filter drop-shadow-md">{item.emoji}</div>
                        <span className="text-[10px] bg-slate-900/80 text-white px-1.5 py-0.5 rounded backdrop-blur mt-1">
                            {item.sender}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 w-full h-full max-w-7xl mx-auto items-center justify-center"
                 style={{
                     gridTemplateColumns: tracks.length === 1 ? '1fr' : tracks.length === 2 ? '1fr 1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
                     gridTemplateRows: tracks.length <= 2 ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))'
                 }}>
                {tracks.map((track) => (
                    <CustomParticipantTile 
                        key={`${track.participant.sid}-${track.source}`} 
                        participantTrack={track} 
                    />
                ))}
            </div>
        </div>
    );
}


function RightChatPanel({ isOpen }) {
    const { send, chatMessages } = useChat();
    const [messageText, setMessageText] = useState("");

    if (!isOpen) return null;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;
        await send(messageText);
        setMessageText("");
    };

    return (
        <div className="w-80 h-[calc(100vh-96px)] bg-slate-900 border-l border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-white tracking-wide text-sm uppercase">Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-end">
                {chatMessages.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center my-auto">Messages sent here are visible to everyone in the workspace session.</p>
                ) : (
                    chatMessages.map((msg, index) => (
                        <div key={index} className={`flex flex-col ${msg.from?.isLocal ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-slate-400 mb-1 font-medium">{msg.from?.name || "Participant"}</span>
                            <div className={`px-3 py-2 rounded-xl text-xs max-w-[85%] break-words ${msg.from?.isLocal ? 'bg-[#C99232] text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                                {msg.message}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-slate-800 flex gap-2">
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Send a message..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#C99232] transition-colors"
                />
                <button type="submit" className="p-2 bg-[#C99232] hover:bg-[#C99232] rounded-xl transition text-white">
                    <RiSendPlane2Fill size={16}/>
                </button>
            </form>
        </div>
    );
}


function FloatingControls({ onToggleChat, isChatOpen, onSendEmoji }) {
    const room = useRoomContext();
    const [micOn, setMicOn] = useState(room.localParticipant.isMicrophoneEnabled);
    const [camOn, setCamOn] = useState(room.localParticipant.isCameraEnabled);
    const [screenOn, setScreenOn] = useState(room.localParticipant.isScreenShareEnabled);
    const [showEmojiBar, setShowEmojiBar] = useState(false);

    const emojis = [ "👍", "🎉", "👏", "😂", "😮", "😢", "🤔"];

    const toggleMic = async () => {
        await room.localParticipant.setMicrophoneEnabled(!micOn);
        setMicOn(!micOn);
    };

    const toggleCamera = async () => {
        await room.localParticipant.setCameraEnabled(!camOn);
        setCamOn(!camOn);
    };

    const toggleScreen = async () => {
        await room.localParticipant.setScreenShareEnabled(!screenOn);
        setScreenOn(!screenOn);
    };

    return (
        <div className="h-24 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-8 text-white select-none z-30 relative">
            
           
            {showEmojiBar && (
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 backdrop-blur px-4 py-2 rounded-2xl flex gap-3 shadow-2xl animate-fade-in z-50">
                    {emojis.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => {
                                onSendEmoji(emoji);
                                setShowEmojiBar(false);
                            }}
                            className="text-2xl hover:scale-135 active:scale-95 transition-transform"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            <div className="text-sm font-medium tracking-wide truncate max-w-[200px]">
                {room.name || "Live Workspace Session"}
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleMic}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${micOn ? "bg-slate-800 hover:bg-slate-700" : "bg-red-500 hover:bg-red-600"}`}
                >
                    {micOn ? <RiMicLine size={22}/> : <RiMicOffLine size={22}/>}
                </button>

                <button
                    onClick={toggleCamera}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${camOn ? "bg-slate-800 hover:bg-slate-700" : "bg-red-500 hover:bg-red-600"}`}
                >
                    {camOn ? <RiVideoLine size={22}/> : <RiVideoOffLine size={22}/>}
                </button>

                <button
                    onClick={toggleScreen}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${screenOn ? "bg-green-600 hover:bg-green-500" : "bg-slate-800 hover:bg-slate-700"}`}
                >
                    <RiComputerLine size={22}/>
                </button>
  
                <button
                    onClick={() => setShowEmojiBar(!showEmojiBar)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${showEmojiBar ? "bg-[#C99232]" : "bg-slate-800 hover:bg-slate-700"}`}
                >
                    <RiEmotionLine size={22}/>
                </button>

                <button
                    onClick={() => {
                        room.disconnect();
                        window.close();
                    }}
                    className="w-14 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all"
                >
                    <RiPhoneFill size={24} className="text-white"/>
                </button>
            </div>

            <div className="w-[100px] flex justify-end">
                <button
                    onClick={onToggleChat}
                    className={`p-3 rounded-xl transition-all duration-200 relative ${isChatOpen ? "bg-[#C99232] text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                >
                    <RiChat3Line size={20}/>
                </button>
            </div>
        </div>
    );
}


function MeetingRoomContent() {
    const room = useRoomContext();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [floatingEmojis, setFloatingEmojis] = useState([]);

   
    const sendEmojiReaction = (emoji) => {
        const payload = JSON.stringify({ type: "emoji_reaction", emoji: emoji, senderName: room.localParticipant.name || "User" });
        const encoder = new TextEncoder();
        const data = encoder.encode(payload);
        
        room.localParticipant.publishData(data, { reliable: true });
        triggerFloatingEmoji(emoji, "You");
    };

    const triggerFloatingEmoji = (emoji, sender) => {
        const id = Date.now() + Math.random();
        setFloatingEmojis((prev) => [...prev, { id, emoji, sender }]);
        setTimeout(() => {
            setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
        }, 2000);
    };
    useEffect(() => {
        const handleDataReceived = (payload, participant) => {
            try {
                const decoder = new TextDecoder();
                const data = JSON.parse(decoder.decode(payload));
                if (data.type === "emoji_reaction") {
                    triggerFloatingEmoji(data.emoji, participant?.name || "Participant");
                }
            } catch (e) {
               
            }
        };

        room.on("dataReceived", handleDataReceived);
        return () => {
            room.off("dataReceived", handleDataReceived);
        };
    }, [room]);

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col overflow-hidden font-sans select-none w-screen h-screen">
            

               
<div className="absolute top-5 left-6 z-50 flex items-center gap-3">

    <div className="w-11 h-11 rounded-xl bg-[#163F68] flex items-center justify-center shadow-lg hover:bg-[#C99232] transition-colors cursor-pointer border border-slate-800/50">
        <RiVideoLine className="text-white text-xl" />
    </div>

    <div>
        <h2 className="text-white text-xl font-bold tracking-wide">
            SHNOOR 
        </h2>

        <p className="text-slate-300 text-sm">
            Workspace Meet
        </p>
    </div>

</div>


            <RoomAudioRenderer />
            <div className="flex flex-1 w-full h-[calc(100vh-96px)] overflow-hidden">
                <ActiveVideoGrid isChatOpen={isChatOpen} floatingEmojis={floatingEmojis} />
                <RightChatPanel isOpen={isChatOpen} />
            </div>
            <FloatingControls 
                onToggleChat={() => setIsChatOpen(!isChatOpen)} 
                isChatOpen={isChatOpen} 
                onSendEmoji={sendEmojiReaction}
            />
        </div>
    );
}

export default function MeetingRoom() {
    const params = useMemo(() => new URLSearchParams(window.location.search), []);
    
   const roomName = params.get("room");

const title = params.get("title") || "Workspace Meeting";

const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

const [token, setToken] = useState("");

const [serverUrl, setServerUrl] = useState("");

const [loading, setLoading] = useState(true);

useEffect(() => {

    async function loadToken() {

        try {

            const res = await axios.post(
                `${API}/livekit/token`,
                {
                    roomName,
                    participantName: currentUser.full_name,
                }
            );

            setToken(res.data.token);

            setServerUrl(res.data.url);

        }

        catch(err){

            console.error(err);

        }

        finally{

            setLoading(false);

        }

    }

    loadToken();

}, []);

    return (
        <LiveKitRoom
           token={token}

            serverUrl={serverUrl}
            connect={true}
            video={true}
            audio={true}
            className="flex-1 flex flex-col h-full w-full justify-between"
        >
            <MeetingRoomContent />
        </LiveKitRoom>
    );
}