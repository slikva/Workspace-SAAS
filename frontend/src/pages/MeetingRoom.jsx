import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useTracks,
    useRoomContext,
    useChat,
    VideoTrack,
    AudioTrack,
    useParticipantInfo,
    useParticipants
} from "@livekit/components-react";
import { Track, RoomEvent } from "livekit-client";
import {
    RiMicLine,
    RiMicOffLine,
    RiVideoLine,
    RiVideoOffLine,
    RiComputerLine,
    RiPhoneFill,
    RiChat3Line,
    RiSendPlane2Fill,
    RiHand,
    RiTimerLine,
    RiRecordCircleLine,
    RiSettings3Line,
    RiGroupLine,
    RiCloseLine,
    RiVolumeUpLine,
    RiShieldCheckLine,
    RiMagicLine,
    RiPlayFill,
    RiStopFill,
    RiToolsLine,
    RiArrowLeftLine,
    RiDownloadLine
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.VITE_API_URL;


const playAlertSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
        console.error("Audio engine interaction warning:", e);
    }
};


function CustomParticipantTile({ participantTrack, raisedHands }) {
    const { participant, source, publication } = participantTrack;
    const { identity } = useParticipantInfo({ participant });
    
    const isTrackEnabled = publication ? (publication.isSubscribed && !publication.isMuted) : false;
    const displayName = identity || participant.name || "Workspace User";
    const initialLetter = displayName.charAt(0).toUpperCase();

    const isCameraVideo = source === Track.Source.Camera && isTrackEnabled;
    const isScreenShareVideo = source === Track.Source.ScreenShare;
    const hasHandRaised = raisedHands.includes(participant.identity);

    return (
        <div className="relative bg-[#0F172A] rounded-2xl overflow-hidden border border-slate-800/60 flex items-center justify-center h-full w-full shadow-lg aspect-video">
            {isCameraVideo || isScreenShareVideo ? (
                <VideoTrack trackRef={participantTrack} className="w-full h-full object-contain bg-slate-950/80 rounded-2xl" />
            ) : (
                <div className="flex flex-col items-center justify-center select-none">
                    <div className="w-20 h-20 rounded-full bg-[#C99328] shadow-2xl flex items-center justify-center font-bold text-3xl text-white tracking-wide border border-white/5 uppercase">
                        {initialLetter}
                    </div>
                </div>
            )}

            {source === Track.Source.Microphone && <AudioTrack trackRef={participantTrack} />}

            <div className="absolute top-4 right-4 flex gap-2 z-10">
                {hasHandRaised && (
                    <motion.div 
                        initial={{ scale: 0, rotate: -20 }} 
                        animate={{ scale: 1, rotate: 0 }} 
                        className="bg-[#C99328] text-white p-2 rounded-xl shadow-md border border-white/10"
                    >
                        <RiHand size={20} />
                    </motion.div>
                )}
            </div>

            <div className="absolute bottom-4 left-4 bg-[#0F172A]/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200 border border-slate-800/40 max-w-[80%] truncate z-10">
                {source === Track.Source.ScreenShare 
                    ? `${displayName}'s Presentation` 
                    : `${displayName} ${participant.isLocal ? "(You)" : ""}`
                }
            </div>
        </div>
    );
}


function ActiveVideoGrid({ raisedHands }) {
    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false }
    ]);

    return (
        <div className="flex-1 p-6 bg-slate-950 transition-all duration-300 h-[calc(100vh-96px)] flex items-center justify-center relative">
            <div className="grid gap-4 w-full h-full max-w-7xl mx-auto items-center justify-center"
                 style={{
                     gridTemplateColumns: tracks.length === 1 ? '1fr' : tracks.length === 2 ? '1fr 1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
                     gridTemplateRows: tracks.length <= 2 ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))'
                 }}>
                {tracks.map((track) => (
                    <CustomParticipantTile 
                        key={`${track.participant.sid}-${track.source}`} 
                        participantTrack={track} 
                        raisedHands={raisedHands}
                    />
                ))}
            </div>
        </div>
    );
}


function RightChatPanel({ isOpen, onClose }) {
    const { send, chatMessages } = useChat();
    const [messageText, setMessageText] = useState("");
    const listEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            listEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, isOpen]);

    if (!isOpen) return null;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;
        await send(messageText);
        setMessageText("");
    };

    return (
        <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            className="w-80 h-[calc(100vh-96px)] bg-[#0F172A] border-l border-slate-800 flex flex-col z-40 shadow-2xl relative"
        >
            <div className="p-4 h-16 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/20">
                <h3 className="font-bold text-white tracking-wider text-normal uppercase flex items-center gap-2">
                    <RiChat3Line className="text-[#C99328]" size={18} /> Workspace Chat
                </h3>
                <button onClick={onClose} className="p-1.5 hover:bg-[#C99328] rounded-xl text-slate-400 hover:text-white transition">
                    <RiCloseLine size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                {chatMessages.length === 0 ? (
                    <div className="my-auto text-center px-4">
                        <p className="text-xs text-slate-500 leading-relaxed">No messages yet.</p>
                    </div>
                ) : (
                    chatMessages.map((msg, index) => (
                        <div key={index} className={`flex flex-col ${msg.from?.isLocal ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-white mb-1 font-semibold">{msg.from?.name || "Participant"}</span>
                            <div className={`px-3 py-2 rounded-2xl text-xs font-semibold max-w-[85%] break-words shadow-sm leading-relaxed ${msg.from?.isLocal ? 'bg-[#C99328] text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                                {msg.message}
                            </div>
                        </div>
                    ))
                )}
                <div ref={listEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-slate-800/60 bg-slate-950/40 flex gap-2 items-center sticky bottom-0">
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#163F68] transition-colors"
                />
                <button type="submit" className="p-2.5 bg-[#163F68] hover:bg-[#C99328]/90 rounded-xl transition text-white shadow-md active:scale-95">
                    <RiSendPlane2Fill size={15}/>
                </button>
            </form>
        </motion.div>
    );
}


function ParticipantsSidebar({ isOpen, onClose, raisedHands }) {
    const room = useRoomContext();
    const participants = useParticipants();
    
    
    const [waitingUsers, setWaitingUsers] = useState([]);

   
    const [activeMenuParticipant, setActiveMenuParticipant] = useState(null);
    const [participantMenuOpen, setParticipantMenuOpen] = useState(false);
    const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
    const [loadingAction, setLoadingAction] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [confirmRemoveTarget, setConfirmRemoveTarget] = useState(null);

   
    useEffect(() => {
        if (!isOpen || !room.name) return;

        const fetchWaitingRoom = async () => {
            try {
                const res = await axios.get(`${API}/meeting/pending-users/${room.name}`);
                if (res.data && res.data.success && Array.isArray(res.data.users)) {
                    setWaitingUsers(res.data.users);
                }
            } catch (err) {
                console.error("Failed to load backend waiting list:", err);
            }
        };

        fetchWaitingRoom();
        const interval = setInterval(fetchWaitingRoom, 2000);
        return () => clearInterval(interval);
    }, [isOpen, room.name]);

   
    const handleOpenMenu = (e, participant) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuCoords({ top: rect.bottom + window.scrollY - 10, left: rect.left + window.scrollX - 160 });
        setActiveMenuParticipant(participant);
        setParticipantMenuOpen(true);
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 4000);
    };

   
    const handleMuteAction = async () => {
        if (!activeMenuParticipant) return;
        try {
            setLoadingAction(true);
            await axios.post(`${API}/meeting/mute`, { identity: activeMenuParticipant.identity, roomName: room.name });
            showToast(`You muted ${activeMenuParticipant.identity || "Participant"}.`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAction(false);
            setParticipantMenuOpen(false);
        }
    };

    const handleStopShareAction = async () => {
        if (!activeMenuParticipant) return;
        try {
            setLoadingAction(true);
            await axios.post(`${API}/meeting/stop-share`, { identity: activeMenuParticipant.identity, roomName: room.name });
            showToast(`Stopped screen share for ${activeMenuParticipant.identity || "Participant"}.`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAction(false);
            setParticipantMenuOpen(false);
        }
    };

    const handleMakePresenterAction = async () => {
        if (!activeMenuParticipant) return;
        try {
            setLoadingAction(true);
            await axios.post(`${API}/meeting/make-presenter`, { identity: activeMenuParticipant.identity, roomName: room.name });
            showToast(`${activeMenuParticipant.identity || "Participant"} is now the presenter.`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAction(false);
            setParticipantMenuOpen(false);
        }
    };

const handleRemoveParticipant = async () => {
        if (!menuParticipant) return;
        try {
            const participantIdentity = menuParticipant.identity || menuParticipant.name;

            
            await axios.post(`${API}/meeting/remove`, { 
                roomName: room.name, 
                identity: participantIdentity 
            });
            
            showToast(`Removed ${participantIdentity} from meeting.`);
        } catch (err) {
            console.error("Failed to remove active participant from session:", err);
            showToast("Failed to remove participant.");
        } finally {
            setParticipantMenuOpen(false);
            setMenuParticipant(null);
        }
    };
   const handleWaitingRoomDecision = async (pUserId, name, decision) => {
        try {
          
            await axios.post(`${API}/meeting/${decision}`, { 
                roomName: room.name, 
                userId: pUserId 
            });
           
            setWaitingUsers(prev => prev.filter(u => String(u.user_id) !== String(pUserId)));
            showToast(`${name} has been ${decision}ted.`);
        } catch (err) {
            console.error(`Failed to execute waiting room ${decision} action:`, err);
            showToast("Failed to process request.");
        }
    };
    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            className="w-80 h-[calc(100vh-96px)] bg-[#0F172A] border-l border-slate-800 flex flex-col z-40 shadow-2xl text-white relative"
        >
          
            <div className="p-4 h-16 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/20">
                <h3 className="font-bold tracking-wider text-xs uppercase flex items-center gap-2">
                    <RiGroupLine className="text-[#C99328]" size={20} /> Participants ({participants.length})
                </h3>
                <button onClick={onClose} className="p-1.5 hover:bg-[#C99328] rounded-xl text-slate-400 hover:text-white transition">
                    <RiCloseLine size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
               
                <div className="space-y-2">
                   
                    {waitingUsers.length > 0 ? (
                        <div className="bg-slate-950/50 rounded-xl p-1.5 border border-slate-800/40 space-y-1.5">
                            {waitingUsers.map(user => (
                                <div key={user.user_id} className="flex items-center justify-between bg-slate-900/40 p-2 rounded-lg border border-slate-800/30">
                                    <span className="text-xs font-semibold text-slate-300 truncate max-w-[100px]">{user.full_name}</span>
                                    <div className="flex items-center gap-1.5">
                                        <button 
                                            onClick={() => handleWaitingRoomDecision(user.user_id, user.full_name, "admit")}
                                            className="px-2.5 py-1 bg-[#163F68] hover:bg-[#163F68]/80 text-white font-bold text-[10px] rounded-md transition"
                                        >
                                            Admit
                                        </button>
                                        <button 
                                            onClick={() => handleWaitingRoomDecision(user.user_id, user.full_name, "reject")}
                                            className="px-2.5 py-1 bg-slate-800 hover:bg-red-950/40 border border-slate-700 text-slate-400 hover:text-red-400 font-bold text-[10px] rounded-md transition"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-950/30 rounded-xl p-3 border border-slate-800/40 text-center text-[11px] font-medium text-slate-500 italic">
                            No Pending Requests
                        </div>
                    )}
                </div>

                {/* 2. Active Session Core Participant Roster list */}
                <div className="space-y-2">
                    <div className="text-[9px] font-bold tracking-widest text-slate-500 uppercase px-1">Active Roster</div>
                    {participants.map((p) => {
                        const nameStr = p.identity || "Workspace User";
                        const isMicMuted = !p.isMicrophoneEnabled;
                        const isCamMuted = !p.isCameraEnabled;
                        const isSpeaking = p.isSpeaking;

                        return (
                            <div key={p.sid} className={`flex items-center justify-between bg-slate-950/30 p-2.5 rounded-xl border transition-all ${isSpeaking ? 'border-[#C99328] bg-[#0F172A]' : 'border-slate-800/40'}`}>
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 font-bold text-[11px] flex items-center justify-center text-slate-300 shrink-0 uppercase">
                                        {nameStr.charAt(0)}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold truncate text-slate-200">
                                            {nameStr} {p.isLocal ? "(You)" : ""}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                                    {raisedHands.includes(p.identity) && (
                                        <div className="text-[#C99328] mr-0.5"><RiHand size={13} /></div>
                                    )}
                                    <div className={`p-1 rounded-md ${isMicMuted ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                                        {isMicMuted ? <RiMicOffLine size={11} /> : <RiMicLine size={11} />}
                                    </div>
                                    <div className={`p-1 rounded-md ${isCamMuted ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                                        {isCamMuted ? <RiVideoOffLine size={11} /> : <RiVideoLine size={11} />}
                                    </div>
                                    
                                   {/* Strict verification: Display Context Command Matrix row trigger ONLY if you are Host */}
                                    {!p.isLocal && (
                                        <button 
                                            onClick={(e) => handleOpenMenu(e, p)}
                                            className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition"
                                        >
                                            <span className="font-bold tracking-tight text-sm leading-none block px-0.5">⋮</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Microservice Operational Context Action Flow Portal */}
            {participantMenuOpen && activeMenuParticipant && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setParticipantMenuOpen(false)} />
                    <div 
                        style={{ top: menuCoords.top, left: menuCoords.left }}
                        className="fixed w-44 bg-[#0F172A] border border-slate-800 rounded-xl shadow-2xl p-1 z-50 animate-fade-in space-y-0.5"
                    >
                        {loadingAction ? (
                            <div className="text-center py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Processing...</div>
                        ) : (
                            <>
                                <button onClick={handleMuteAction} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-900 rounded-lg text-slate-200 flex items-center gap-2 transition">
                                    <RiMicOffLine className="text-red-400" size={13} /> Mute Participant
                                </button>
                                <button onClick={handleStopShareAction} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-900 rounded-lg text-slate-200 flex items-center gap-2 transition">
                                    <RiComputerLine className="text-[#C99328]" size={13} /> Stop Screen Share
                                </button>
                                <button onClick={handleMakePresenterAction} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-900 rounded-lg text-slate-200 flex items-center gap-2 transition">
                                    <RiMagicLine className="text-blue-400" size={13} /> Make Presenter
                                </button>
                                <div className="border-t border-slate-800/80 my-1" />
                              
                                <button onClick={() => setParticipantMenuOpen(false)} className="w-full text-left px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider hover:bg-slate-900 rounded-lg text-slate-500 transition">
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Modal Removal Intercept Layer */}
            {confirmRemoveTarget && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-xs bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl text-center">
                        <p className="text-xs font-semibold text-slate-200">Remove {confirmRemoveTarget.identity} from Meeting?</p>
                        <div className="flex gap-2 justify-center">
                            <button onClick={() => setConfirmRemoveTarget(null)} className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg text-xs font-bold transition">
                                Cancel
                            </button>
                            <button onClick={handleRemoveParticipant} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition">
                                Remove
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Status Feedback Toast Node */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-4 left-4 right-4 bg-[#163F68] border border-[#C99328]/30 text-white text-xs font-bold px-3 py-2.5 rounded-xl shadow-lg z-50"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}


function MeetingToolsSidebar({ 
    isOpen, onClose, timerConfig, onStartTimer, onCancelTimer,
    recordingState, handleToggleRecording
}) {
    const room = useRoomContext();
    const remoteParticipants = useParticipants();
    const [currentSubPage, setCurrentSubPage] = useState("main"); 
    const [devices, setDevices] = useState([]);
    
    
    const [timerH, setTimerH] = useState("0");
    const [timerM, setTimerM] = useState("5"); 
    const [timerS, setTimerS] = useState("0");
    const [selectedPresenter, setSelectedPresenter] = useState("");

    
    const activePresenters = useMemo(() => {
        const list = [];
        if (room.localParticipant.isScreenShareEnabled) {
            list.push({
                identity: room.localParticipant.identity,
                name: room.localParticipant.name || "You"
            });
        }
        remoteParticipants.forEach(p => {
            if (p.isScreenShareEnabled) {
                list.push({
                    identity: p.identity,
                    name: p.name || p.identity
                });
            }
        });
        return list;
    }, [remoteParticipants, room.localParticipant.isScreenShareEnabled, room.localParticipant.identity, room.localParticipant.name]);

    
    useEffect(() => {
        if (activePresenters.length > 0) {
            if (!selectedPresenter || !activePresenters.some(p => p.identity === selectedPresenter)) {
                setSelectedPresenter(activePresenters[0].identity);
            }
        } else {
            setSelectedPresenter("");
        }
    }, [activePresenters, selectedPresenter]);

    useEffect(() => {
        if (isOpen && currentSubPage === "settings") {
            navigator.mediaDevices.enumerateDevices().then(setDevices).catch(console.error);
        }
    }, [isOpen, currentSubPage]);

    if (!isOpen) return null;

    const handleTimerSubmit = (e) => {
        e.preventDefault();
        const totalSec = (parseInt(timerH) || 0) * 3600 + (parseInt(timerM) || 0) * 60 + (parseInt(timerS) || 0);
        if (totalSec <= 0) return;
        onStartTimer(totalSec, selectedPresenter);
    };

    return (
        <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            className="w-80 h-[calc(100vh-96px)] bg-[#0F172A] border-l border-slate-800 flex flex-col z-40 shadow-2xl text-white"
        >
           
            <div className="p-4 h-16 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/20">
                <div className="flex items-center gap-2">
                    {currentSubPage !== "main" && (
                        <button 
                            onClick={() => setCurrentSubPage("main")}
                            className="p-1 hover:bg-slate-800/80 rounded-lg text-slate-400 hover:text-white transition mr-1"
                        >
                            <RiArrowLeftLine size={20} />
                        </button>
                    )}
                    <h3 className="font-bold tracking-wider text-xs uppercase flex items-center gap-2">
                        <RiToolsLine className="text-[#C99328]" size={18} /> 
                        {currentSubPage === "main" && "Meeting Tools"}
                        {currentSubPage === "settings" && "Default Controls"}
                        {currentSubPage === "timer" && " Timer"}
                    </h3>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-[#C99328] rounded-xl text-slate-400 hover:text-white transition">
                    <RiCloseLine size={18} />
                </button>
            </div>

           
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentSubPage === "main" && (
                    <div className="space-y-3 pt-2">
                        <button 
                            onClick={() => setCurrentSubPage("settings")}
                            className="w-full text-left p-4 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 hover:border-[#C99328]/60 rounded-xl transition group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-[#C99328]/20 border border-slate-800 transition">
                                    <RiSettings3Line className="text-white group-hover:text-[#C99328]" size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-200">Device Settings</span>
                                </div>
                            </div>
                        </button>

                        <button 
                            onClick={() => setCurrentSubPage("timer")}
                            className="w-full text-left p-4 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 hover:border-[#C99328]/60 rounded-xl transition group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-[#C99328]/20 border border-slate-800 transition">
                                    <RiTimerLine className="text-white group-hover:text-[#C99328]" size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-200">Presentation Timer</span>
                                </div>
                            </div>
                            {timerConfig.isActive && (
                                <span className="w-2 h-2 rounded-full bg-[#C99328] animate-pulse" />
                            )}
                        </button>
                    </div>
                )}
                {/* --- SETTINGS / LOCK MEETING CAPABILITY --- */}
                {currentSubPage === "settings" && (
                    <div className="space-y-4 pt-1 animate-fade-in">
                        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-200">Lock Meeting</span>
                                    <span className="text-[10px] text-slate-500 mt-0.5">Prevent new participants from request joining</span>
                                </div>
                                <button
                                    onClick={async () => {
                                        const nextLockState = !room.isLocked; 
                                       
                                        room.isLocked = nextLockState;
                                        try {
                                            await axios.post(`${API}/meeting/${nextLockState ? "lock" : "unlock"}`, { roomName: room.name });
                                            
                                            setCurrentSubPage("main");
                                        } catch (err) {
                                            console.error("Lock endpoint negotiation failure:", err);
                                        }
                                    }}
                                    className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${room.isLocked ? "bg-[#C99328]" : "bg-slate-800"}`}
                                >
                                    <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${room.isLocked ? "translate-x-4" : "translate-x-0"}`} />
                                </button>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1.5 rounded-lg">
                                <RiShieldCheckLine className="text-[#C99328]" size={12} />
                                Status: <span className="font-bold uppercase tracking-wider text-white">{room.isLocked ? "Session Locked" : "Session Open"}</span>
                            </div>
                        </div>
                    </div>
                )}

                
              
                {currentSubPage === "timer" && (
                    <div className="space-y-4 pt-1 animate-fade-in">
                        {timerConfig.isActive ? (
                            <div className="text-center space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/60">
                                <div className="text-[12px] font-bold text-[#C99328] uppercase tracking-widest animate-pulse"> Timer</div>
                                {timerConfig.presenterIdentity && (
                                    <p className="text-[11px] text-slate-400">
                                        Presenting: <span className="text-white font-semibold">{timerConfig.presenterIdentity === room.localParticipant.identity ? "You" : timerConfig.presenterIdentity}</span>
                                    </p>
                                )}
                                <div className="text-4xl font-mono tracking-wider font-extrabold text-white py-2">
                                    {(() => {
                                        const hours = Math.floor(timerConfig.remaining / 3600).toString().padStart(2, "0");
                                        const minutes = Math.floor((timerConfig.remaining % 3600) / 60).toString().padStart(2, "0");
                                        const seconds = (timerConfig.remaining % 60).toString().padStart(2, "0");
                                        return `${hours}:${minutes}:${seconds}`;
                                    })()}
                                </div>
                                <button onClick={onCancelTimer} className="w-full py-2.5 bg-[#C99328] hover:bg-[#C99328]/80 text-white font-semibold rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition active:scale-95">
                                    Stop
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleTimerSubmit} className="space-y-4">
                             
                                <div className="space-y-1.5">
                                   
                                    {activePresenters.length === 0 ? (
                                        <div className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl px-3 py-3 text-xs italic">
                                           Select Participants
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedPresenter}
                                            onChange={(e) => setSelectedPresenter(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#163F68] font-semibold"
                                        >
                                            {activePresenters.map((p) => (
                                                <option key={p.identity} value={p.identity}>
                                                    {p.name} {p.identity === room.localParticipant.identity ? "(You)" : ""}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1 text-center">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Hours</label>
                                        <input type="number" min="0" max="23" value={timerH} onChange={e => setTimerH(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 text-center font-mono font-bold text-xs focus:outline-none focus:border-[#163F68]" />
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Minutes</label>
                                        <input type="number" min="0" max="59" value={timerM} onChange={e => setTimerM(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 text-center font-mono font-bold text-xs focus:outline-none focus:border-[#163F68]" />
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Seconds</label>
                                        <input type="number" min="0" max="59" value={timerS} onChange={e => setTimerS(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 text-center font-mono font-bold text-xs focus:outline-none focus:border-[#163F68]" />
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={activePresenters.length === 0}
                                    className={`w-full py-3 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition active:scale-95 ${activePresenters.length === 0 ? "bg-slate-800 text-slate-600 cursor-not-allowed shadow-none" : "bg-[#163F68] hover:bg-[#C99328]/80"}`}
                                >
                                    <RiPlayFill size={14} /> Timer
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}


function FloatingControls({ 
    onToggleChat, isChatOpen, 
    onToggleParticipants, isParticipantsOpen, 
    onToggleTools, isToolsOpen,
    onToggleHand, hasHandRaised, 
    timerConfig, recordingState, handleToggleRecording
}) {
    const room = useRoomContext();
    const [micOn, setMicOn] = useState(room.localParticipant.isMicrophoneEnabled);
    const [camOn, setCamOn] = useState(room.localParticipant.isCameraEnabled);
    const [screenOn, setScreenOn] = useState(room.localParticipant.isScreenShareEnabled);

  
    useEffect(() => {
        setScreenOn(room.localParticipant.isScreenShareEnabled);
    }, [room.localParticipant.isScreenShareEnabled]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

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
        <div className="h-24 bg-[#0F172A] border-t border-slate-800/80 grid grid-cols-3 items-center px-8 text-white select-none z-30 relative shadow-xl">
            
            
            <div className="flex items-center gap-2">
                {recordingState.isRecording && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest font-mono shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        REC {formatTime(recordingState.recordingTime)}
                    </div>
                )}
                {timerConfig.isActive && (
                    <div className="flex items-center gap-1.5 bg-[#C99328]/10 border border-[#C99328]/20 text-[#C99328] px-3 py-1.5 rounded-full text-[12px] font-bold font-mono shadow-sm">
                        <RiTimerLine className="animate-pulse" size={13} />
                        {(() => {
                            const hours = Math.floor(timerConfig.remaining / 3600).toString().padStart(2, "0");
                            const minutes = Math.floor((timerConfig.remaining % 3600) / 60).toString().padStart(2, "0");
                            const seconds = (timerConfig.remaining % 60).toString().padStart(2, "0");
                            return `${hours}:${minutes}:${seconds}`;
                        })()}
                    </div>
                )}
            </div>

           
            <div className="flex items-center justify-center gap-3">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={toggleMic} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border border-slate-800/60 shadow-md ${micOn ? "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white" : "bg-red-500 text-white hover:bg-red-600"}`}>
                    {micOn ? <RiMicLine size={18}/> : <RiMicOffLine size={18}/>}
                </motion.button>

                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={toggleCamera} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border border-slate-800/60 shadow-md ${camOn ? "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white" : "bg-red-500 text-white hover:bg-red-600"}`}>
                    {camOn ? <RiVideoLine size={18}/> : <RiVideoOffLine size={18}/>}
                </motion.button>

                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={toggleScreen} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border border-slate-800/60 shadow-md ${screenOn ? "bg-[#163F68] text-white hover:bg-[#163F68]/90" : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"}`}>
                    <RiComputerLine size={18}/>
                </motion.button>

                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={onToggleHand} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border border-slate-800/60 shadow-md ${hasHandRaised ? "bg-[#C99328] text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"}`}>
                    <RiHand size={18}/>
                </motion.button>

                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => { room.disconnect(); window.close(); }} className="w-14 h-11 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all shadow-xl border border-transparent ml-2">
                    <RiPhoneFill size={19}/>
                </motion.button>
            </div>

           
            <div className="flex items-center justify-end gap-3">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={onToggleParticipants} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border border-slate-800/60 shadow-md ${isParticipantsOpen ? "bg-[#C99328] text-white border-transparent" : "bg-slate-800 text-slate-300 hover:bg-[#C99328] hover:text-white"}`}>
                    <RiGroupLine size={18}/>
                </motion.button>

                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={onToggleChat} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border border-slate-800/60 shadow-md ${isChatOpen ? "bg-[#C99328] text-white border-transparent" : "bg-slate-800 text-slate-300 hover:bg-[#C99328] hover:text-white"}`}>
                    <RiChat3Line size={18}/>
                </motion.button>

                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={onToggleTools} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border border-slate-800/60 shadow-md ${isToolsOpen ? "bg-[#C99328] text-white border-transparent" : "bg-slate-800 text-slate-300 hover:bg-[#C99328] hover:text-white"}`}>
                    <RiToolsLine size={18}/>
                </motion.button>
            </div>

        </div>
    );
}


function MeetingRoomContent() {
    const room = useRoomContext();
    const [activePanel, setActivePanel] = useState(null); // 'chat' | 'participants' | 'tools' | null
    const [raisedHands, setRaisedHands] = useState([]);
    
    const [timerConfig, setTimerConfig] = useState({
        isActive: false,
        total: 0,
        remaining: 0,
        presenterIdentity: ""
    });

    
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);

    const hasHandRaised = raisedHands.includes(room.localParticipant.identity);

    const togglePanel = (panelName) => {
        setActivePanel(prev => prev === panelName ? null : panelName);
    };

    const toggleHandRaise = () => {
        const nextState = !hasHandRaised;
        const payload = JSON.stringify({ 
            type: "hand_raise", 
            raised: nextState,
            identity: room.localParticipant.identity 
        });
        const data = new TextEncoder().encode(payload);
        room.localParticipant.publishData(data, { reliable: true });

        setRaisedHands(prev => 
            nextState 
                ? [...prev, room.localParticipant.identity] 
                : prev.filter(id => id !== room.localParticipant.identity)
        );
    };

    const handleStartTimer = (durationSeconds, presenterIdentity) => {
        const payload = JSON.stringify({
            type: "timer_start",
            duration: durationSeconds,
            stamp: Date.now(),
            presenterIdentity: presenterIdentity
        });
        const data = new TextEncoder().encode(payload);
        room.localParticipant.publishData(data, { reliable: true });

        setTimerConfig({
            isActive: true,
            total: durationSeconds,
            remaining: durationSeconds,
            presenterIdentity: presenterIdentity
        });
    };

    const handleCancelTimer = () => {
        const payload = JSON.stringify({ type: "timer_stop" });
        const data = new TextEncoder().encode(payload);
        room.localParticipant.publishData(data, { reliable: true });

        setTimerConfig({ isActive: false, total: 0, remaining: 0, presenterIdentity: "" });
    };

    const handleToggleRecording = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                recordedChunksRef.current = [];
                const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
                
                recorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        recordedChunksRef.current.push(e.data);
                    }
                };

                recorder.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Workspace-Capture-${Date.now()}.webm`;
                    a.click();
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorderRef.current = recorder;
                recorder.start(1000);
                setIsRecording(true);
                setRecordingTime(0);
                recordingIntervalRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
            } catch (err) {
                console.error("Local tracking resource access denied:", err);
            }
        } else {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            clearInterval(recordingIntervalRef.current);
            setIsRecording(false);
            setRecordingTime(0);
        }
    };

    
    useEffect(() => {
        let interval = null;
        if (timerConfig.isActive && timerConfig.remaining > 0) {
            interval = setInterval(() => {
                setTimerConfig(prev => {
                    if (prev.remaining <= 1) {
                        clearInterval(interval);
                        playAlertSound();
                        
                      
                        if (prev.presenterIdentity === room.localParticipant.identity) {
                            if (room.localParticipant.isScreenShareEnabled) {
                                room.localParticipant.setScreenShareEnabled(false).catch(err => {
                                    console.error("Failed to automatically terminate screen share track:", err);
                                });
                            }
                        }

                        return { isActive: false, total: 0, remaining: 0, presenterIdentity: "" };
                    }
                    return { ...prev, remaining: prev.remaining - 1 };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerConfig.isActive, timerConfig.remaining, room.localParticipant]);

   
    useEffect(() => {
        const handleDataReceived = (payload, participant) => {
            try {
                const data = JSON.parse(new TextDecoder().decode(payload));
                if (data.type === "hand_raise") {
                    setRaisedHands(prev => 
                        data.raised 
                            ? [...new Set([...prev, data.identity])] 
                            : prev.filter(id => id !== data.identity)
                    );
                } else if (data.type === "timer_start") {
                    const elapsed = Math.floor((Date.now() - data.stamp) / 1000);
                    const rem = data.duration - elapsed;
                    if (rem > 0) {
                        setTimerConfig({
                            isActive: true,
                            total: data.duration,
                            remaining: rem,
                            presenterIdentity: data.presenterIdentity
                        });
                    }
                } else if (data.type === "timer_stop") {
                    setTimerConfig({ isActive: false, total: 0, remaining: 0, presenterIdentity: "" });
                }
            } catch (e) {
               console.error("Data tracking exception:", e);
            }
        };

        const handleParticipantDisconnected = (p) => {
            setRaisedHands(prev => prev.filter(id => id !== p.identity));
        };

        room.on(RoomEvent.DataReceived, handleDataReceived);
        room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
        return () => {
            room.off(RoomEvent.DataReceived, handleDataReceived);
            room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
        };
    }, [room]);

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col overflow-hidden font-sans select-none w-screen h-screen">
            
           
            <div className="absolute top-5 left-6 z-50 flex items-center gap-3 bg-[#0F172A]/40 backdrop-blur-md pr-4 pl-2 py-1.5 rounded-2xl border border-slate-800/40">
                <div className="w-15 h-15 rounded-xl bg-[#0F172A] flex items-center justify-center shadow-md border border-white/5 hover:bg-[#C99328] hover:text-white transition">
                    <RiShieldCheckLine className="text-white text-lg"  />
                </div>
                <div>
                    <h2 className="text-white text-large font-bold tracking-wider leading-none">SHNOOR</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Workspace Meet</p>
                </div>
            </div>

            <RoomAudioRenderer />
            
            <div className="flex flex-1 w-full h-[calc(100vh-96px)] overflow-hidden relative">
                
               
                <ActiveVideoGrid raisedHands={raisedHands} />
                
               
                <AnimatePresence mode="wait">
                    {activePanel === 'chat' && (
                        <RightChatPanel key="chat" isOpen={true} onClose={() => setActivePanel(null)} />
                    )}
                    {activePanel === 'participants' && (
                        <ParticipantsSidebar key="participants" isOpen={true} onClose={() => setActivePanel(null)} raisedHands={raisedHands} />
                    )}
                    {activePanel === 'tools' && (
                        <MeetingToolsSidebar 
                            key="tools" 
                            isOpen={true} 
                            onClose={() => setActivePanel(null)} 
                            timerConfig={timerConfig}
                            onStartTimer={handleStartTimer}
                            onCancelTimer={handleCancelTimer}
                            recordingState={{ isRecording, recordingTime }}
                            handleToggleRecording={handleToggleRecording}
                        />
                    )}
                </AnimatePresence>
            </div>

            <FloatingControls 
                onToggleChat={() => togglePanel('chat')} 
                isChatOpen={activePanel === 'chat'} 
                onToggleParticipants={() => togglePanel('participants')}
                isParticipantsOpen={activePanel === 'participants'}
                onToggleTools={() => togglePanel('tools')}
                isToolsOpen={activePanel === 'tools'}
                onToggleHand={toggleHandRaise}
                hasHandRaised={hasHandRaised}
                timerConfig={timerConfig}
                recordingState={{ isRecording, recordingTime }}
                handleToggleRecording={handleToggleRecording}
            />
        </div>
    );
}

export default function MeetingRoom() {
    const params = useMemo(() => new URLSearchParams(window.location.search), []);
    const roomName = params.get("room");
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const userId = currentUser.user_id || currentUser.id || "74";
    const fullName = currentUser.full_name || currentUser.fullName || "Workspace Delegate";
    const email = currentUser.email || "abc@gmail.com";

    const [token, setToken] = useState("");
    const [serverUrl, setServerUrl] = useState("");
    const [loading, setLoading] = useState(true);

    const [waitingStatus, setWaitingStatus] = useState("requesting");

   
    useEffect(() => {
        if (!roomName) return;

        async function orchestrateMeetingFlow() {
            try {
                const res = await axios.get(`${API}/meeting/by-room/${roomName}`);
                if (res.data && res.data.success && res.data.meeting) {
                    const meeting = res.data.meeting;
                    
                  if (String(userId) === String(meeting.created_by) || String(currentUser.user_id) === String(meeting.created_by)) {
                      
                        setWaitingStatus("approved");
                    } else {
                       
                        await axios.post(`${API}/meeting/request-join`, {
                            roomName,
                            userId,
                            fullName,
                            email
                        });
                        setWaitingStatus("waiting");
                    }
                } else {
                    setWaitingStatus("waiting");
                }
            } catch (err) {
                console.error("Meeting authorization checking error:", err);
                setWaitingStatus("waiting");
            }
        }
        orchestrateMeetingFlow();
    }, [roomName, userId, fullName, email]);

   
    useEffect(() => {
        if (waitingStatus !== "waiting" || !roomName) return;

        const pollStatus = async () => {
            try {
                const res = await axios.get(`${API}/meeting/status/${roomName}/${userId}`);
                if (res.data && res.data.success) {
                    const currentStatus = res.data.status; 
                    if (currentStatus === "approved" || currentStatus === "rejected") {
                        setWaitingStatus(currentStatus);
                    }
                }
            } catch (err) {
                console.error("Waiting status lookup error:", err);
            }
        };

        const interval = setInterval(pollStatus, 3000);
        return () => clearInterval(interval);
    }, [waitingStatus, roomName, userId]);

    
    useEffect(() => {
        if (waitingStatus !== "approved" || !roomName) return;

       async function loadToken() {
            try {
                const res = await axios.post(
                    `${API}/livekit/token`,
                    {
                        roomName,
                        participantName: fullName,
                        userId: userId 
                    }
                );
                setToken(res.data.token);
                setServerUrl(res.data.url);
            } catch(err){
                console.error("Token orchestration failure:", err);
            } finally{
                setLoading(false);
            }
        }
        loadToken();
    }, [waitingStatus, roomName, fullName]);

   
    if (waitingStatus === "requesting" || (waitingStatus === "approved" && loading)) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
                <div className="w-8 h-8 border-4 border-[#163F68] border-t-[#C99328] rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Loading...</p>
            </div>
        );
    }

   
    if (waitingStatus === "rejected") {
        return (
            <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-center font-sans select-none text-white p-4 relative">
                <div className="absolute top-8 left-8 flex items-center gap-3 bg-[#0F172A]/40 backdrop-blur-md pr-4 pl-2 py-1.5 rounded-2xl border border-slate-800/40">
                    <div className="w-12 h-12 rounded-xl bg-[#0F172A] flex items-center justify-center shadow-md border border-white/5">
                        <RiShieldCheckLine className="text-white text-lg" />
                    </div>
                    <div>
                        <h2 className="text-white text-sm font-bold tracking-wider leading-none">SHNOOR</h2>
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">Workspace Meet</p>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6"
                >
                    <div className="w-16 h-16 bg-red-950/20 border border-red-900/40 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                        <RiCloseLine size={28} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white tracking-wide">Request Rejected</h3>
                        
                    </div>
                    <div className="pt-2">
                        <button 
                            onClick={() => { window.close(); window.location.href = "/"; }}
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold rounded-xl text-xs uppercase tracking-wider transition active:scale-95"
                        >
                            Return Home
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

   
    if (waitingStatus === "waiting") {
        return (
            <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-center font-sans select-none text-white p-4 relative">
                <div className="absolute top-8 left-8 flex items-center gap-3 bg-[#0F172A]/40 backdrop-blur-md pr-4 pl-2 py-1.5 rounded-2xl border border-slate-800/40">
                    <div className="w-12 h-12 rounded-xl bg-[#0F172A] flex items-center justify-center shadow-md border border-white/5">
                        <RiShieldCheckLine className="text-white text-lg" />
                    </div>
                    <div>
                        <h2 className="text-white text-sm font-bold tracking-wider leading-none">SHNOOR</h2>
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">Workspace Meet</p>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6"
                >
                    <div className="w-16 h-16 bg-[#163F68]/20 border border-[#163F68]/40 rounded-2xl flex items-center justify-center mx-auto text-[#C99328]">
                        <RiGroupLine size={28} className="animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white tracking-wide">Waiting for Host Approval</h3>
                        
                    </div>
                    <div className="pt-2">
                        <button 
                            onClick={() => { window.close(); window.location.href = "/"; }}
                            className="px-5 py-2.5 bg-slate-900 hover:bg-red-950/40 border border-slate-800 text-slate-400 hover:text-red-400 font-semibold rounded-xl text-xs uppercase tracking-wider transition active:scale-95"
                        >
                            Cancel Request
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

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