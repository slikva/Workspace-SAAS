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
    RiSparklesLine,
    RiPlayFill,
    RiStopFill
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.VITE_API_URL;

// --- AUDIO ALERTS ---
const playAlertSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
        console.error("Audio clip play blocked by browser interaction restrictions", e);
    }
};

// --- CUSTOM PARTICIPANT GRID CARD ---
function CustomParticipantTile({ participantTrack, raisedHands }) {
    const { participant, source, publication } = participantTrack;
    const { identity } = useParticipantInfo({ participant });
    
    const isTrackEnabled = publication ? (publication.isSubscribed && !publication.isMuted) : false;
    const displayName = identity || participant.name || "User";
    const initialLetter = displayName.charAt(0).toUpperCase();

    const isCameraVideo = source === Track.Source.Camera && isTrackEnabled;
    const isScreenShareVideo = source === Track.Source.ScreenShare;
    const hasHandRaised = raisedHands.includes(participant.identity);

    return (
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800/80 flex items-center justify-center h-full w-full shadow-md aspect-video">
            {isCameraVideo || isScreenShareVideo ? (
                <VideoTrack trackRef={participantTrack} className="w-full h-full object-contain bg-slate-950 rounded-xl" />
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-[#163F68] shadow-xl flex items-center justify-center font-bold text-4xl text-white tracking-wider border border-white/10 uppercase">
                        {initialLetter}
                    </div>
                </div>
            )}

            {source === Track.Source.Microphone && <AudioTrack trackRef={participantTrack} />}

            <div className="absolute top-3 right-3 flex gap-2 z-10">
                {hasHandRaised && (
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="bg-[#C99328] text-white p-2 rounded-full shadow-lg"
                    >
                        <RiHand size={18} />
                    </motion.div>
                )}
            </div>

            <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur px-3 py-1 rounded-lg text-xs font-semibold text-slate-200 border border-slate-800/50 max-w-[85%] truncate z-10">
                {source === Track.Source.ScreenShare 
                    ? `${displayName}'s Presentation` 
                    : `${displayName} ${participant.isLocal ? "(You)" : ""}`
                }
            </div>
        </div>
    );
}

// --- ACTIVE VIDEO CANVAS GRID ---
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

// --- ENTERPRISE SLIDING CHAT PANEL ---
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
            transition={{ type: "tween", duration: 0.25 }}
            className="w-85 h-[calc(100vh-96px)] bg-slate-900 border-l border-slate-800 flex flex-col z-40 shadow-2xl relative"
        >
            <div className="p-4 h-14 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
                <h3 className="font-bold text-white tracking-wide text-xs uppercase flex items-center gap-2">
                    <RiChat3Line className="text-[#163F68]" size={16} /> In-Meeting Chat
                </h3>
                <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
                    <RiCloseLine size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                {chatMessages.length === 0 ? (
                    <div className="my-auto text-center px-4">
                        <p className="text-xs text-slate-500">Messages sent here are visible to everyone in the channel.</p>
                    </div>
                ) : (
                    chatMessages.map((msg, index) => (
                        <div key={index} className={`flex flex-col ${msg.from?.isLocal ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-slate-500 mb-1 font-semibold">{msg.from?.name || "Participant"}</span>
                            <div className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] break-words shadow-sm leading-relaxed ${msg.from?.isLocal ? 'bg-[#163F68] text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                                {msg.message}
                            </div>
                        </div>
                    ))
                )}
                <div ref={listEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950/40 flex gap-2 items-center sticky bottom-0">
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#163F68] transition-colors"
                />
                <button type="submit" className="p-2.5 bg-[#163F68] hover:bg-[#163F68]/80 rounded-xl transition text-white shadow-md active:scale-95">
                    <RiSendPlane2Fill size={15}/>
                </button>
            </form>
        </motion.div>
    );
}

// --- ENTERPRISE SLIDING PARTICIPANTS PANEL ---
function ParticipantsSidebar({ isOpen, onClose, raisedHands }) {
    const participants = useParticipants();
    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="w-85 h-[calc(100vh-96px)] bg-slate-900 border-l border-slate-800 flex flex-col z-40 shadow-2xl text-white"
        >
            <div className="p-4 h-14 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
                <h3 className="font-bold tracking-wide text-xs uppercase flex items-center gap-2">
                    <RiGroupLine className="text-[#163F68]" size={16} /> Roster ({participants.length})
                </h3>
                <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
                    <RiCloseLine size={18} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {participants.map((p) => {
                    const nameStr = p.identity || "User";
                    const isMicMuted = !p.isMicrophoneEnabled;
                    const isCamMuted = !p.isCameraEnabled;
                    const isSpeaking = p.isSpeaking;

                    return (
                        <div key={p.sid} className={`flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border transition-all ${isSpeaking ? 'border-[#C99328]/80 bg-slate-900' : 'border-slate-800/40'}`}>
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 font-bold text-xs flex items-center justify-center text-slate-300 shrink-0 select-none uppercase">
                                    {nameStr.charAt(0)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold truncate text-slate-200">
                                        {nameStr} {p.isLocal ? "(You)" : ""}
                                    </span>
                                    {p.isLocal && (
                                        <span className="text-[9px] font-bold text-[#163F68] uppercase tracking-wider">Host Organizer</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                {raisedHands.includes(p.identity) && (
                                    <div className="text-[#C99328] animate-pulse">
                                        <RiHand size={15} />
                                    </div>
                                )}
                                <div className={`p-1.5 rounded-md ${isMicMuted ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                                    {isMicMuted ? <RiMicOffLine size={13} /> : <RiMicLine size={13} />}
                                </div>
                                <div className={`p-1.5 rounded-md ${isCamMuted ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                                    {isCamMuted ? <RiVideoOffLine size={13} /> : <RiVideoLine size={13} />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// --- SYNCHRONIZED PRESENTATION TIMER MANAGEMENT PANEL ---
function PresentationTimerPanel({ isOpen, onClose, timerConfig, onStartTimer, onCancelTimer }) {
    const [h, setH] = useState("0");
    const [m, setM] = useState("15");
    const [s, setS] = useState("0");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const totalSec = (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
        if (totalSec <= 0) return;
        onStartTimer(totalSec);
    };

    return (
        <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="w-85 h-[calc(100vh-96px)] bg-slate-900 border-l border-slate-800 flex flex-col z-40 shadow-2xl text-white"
        >
            <div className="p-4 h-14 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
                <h3 className="font-bold tracking-wide text-xs uppercase flex items-center gap-2">
                    <RiTimerLine className="text-[#163F68]" size={16} /> Live Timer Controller
                </h3>
                <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
                    <RiCloseLine size={18} />
                </button>
            </div>
            
            <div className="flex-1 p-5 space-y-6 flex flex-col justify-center">
                {timerConfig.isActive ? (
                    <div className="text-center space-y-4">
                        <div className="text-xs font-bold text-[#C99328] uppercase tracking-widest animate-pulse">Meeting Count Down Active</div>
                        <div className="text-5xl font-mono tracking-wider font-extrabold text-slate-100 bg-slate-950/60 py-6 rounded-2xl border border-slate-800">
                            {(() => {
                                const hours = Math.floor(timerConfig.remaining / 3600).toString().padStart(2, "0");
                                const minutes = Math.floor((timerConfig.remaining % 3600) / 60).toString().padStart(2, "0");
                                const seconds = (timerConfig.remaining % 60).toString().padStart(2, "0");
                                return `${hours}:${minutes}:${seconds}`;
                            })()}
                        </div>
                        <button onClick={onCancelTimer} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition active:scale-95">
                            <RiStopFill size={15} /> Abort Timer Session
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="text-center text-xs text-slate-400 px-2 leading-relaxed">
                            Set an orchestration countdown clock. The duration state updates dynamically for all authenticated remote workspace connections.
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5 text-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hours</label>
                                <input type="number" min="0" max="23" value={h} onChange={e => setH(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 text-center font-mono font-bold text-md focus:outline-none focus:border-[#163F68]" />
                            </div>
                            <div className="space-y-1.5 text-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Minutes</label>
                                <input type="number" min="0" max="59" value={m} onChange={e => setM(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 text-center font-mono font-bold text-md focus:outline-none focus:border-[#163F68]" />
                            </div>
                            <div className="space-y-1.5 text-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Seconds</label>
                                <input type="number" min="0" max="59" value={s} onChange={e => setS(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 text-center font-mono font-bold text-md focus:outline-none focus:border-[#163F68]" />
                            </div>
                        </div>
                        <button type="submit" className="w-full py-3 bg-[#163F68] hover:bg-[#163F68]/80 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition active:scale-95">
                            <RiPlayFill size={15} /> Initialize Broadcast Clock
                        </button>
                    </form>
                )}
            </div>
        </motion.div>
    );
}

// --- ENTERPRISE HARDWARE PARAMETERS CONFIGURATION MODAL ---
function SettingsModal({ isOpen, onClose }) {
    const [devices, setDevices] = useState([]);
    const [videoQuality, setVideoQuality] = useState("high");
    const [noiseSuppression, setNoiseSuppression] = useState(true);
    const [echoCancellation, setEchoCancellation] = useState(true);
    const [mirrorCamera, setMirrorCamera] = useState(true);

    useEffect(() => {
        if (isOpen) {
            navigator.mediaDevices.enumerateDevices().then(setDevices).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center text-white p-4 animate-fade-in">
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col"
            >
                <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                    <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-slate-200">
                        <RiSettings3Line className="text-[#C99328]" size={18} /> Device Control Configuration
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white">
                        <RiCloseLine size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <RiVideoLine size={14} /> Video Capture Device
                        </label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#163F68] text-slate-200">
                            {devices.filter(d => d.kind === "videoinput").map(d => (
                                <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera Source Option (${d.deviceId.slice(0,5)})`}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <RiMicLine size={14} /> Audio Mic input
                        </label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#163F68] text-slate-200">
                            {devices.filter(d => d.kind === "audioinput").map(d => (
                                <option key={d.deviceId} value={d.deviceId}>{d.label || `Audio Line Capture (${d.deviceId.slice(0,5)})`}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <RiVolumeUpLine size={14} /> Speaker Audio Output
                        </label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#163F68] text-slate-200">
                            {devices.filter(d => d.kind === "audiooutput").map(d => (
                                <option key={d.deviceId} value={d.deviceId}>{d.label || `Audio Receiver Pipeline (${d.deviceId.slice(0,5)})`}</option>
                            ))}
                        </select>
                    </div>

                    <div className="border-t border-slate-800/80 my-2 pt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution Profile</label>
                            <select value={videoQuality} onChange={(e) => setVideoQuality(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#163F68] text-slate-200">
                                <option value="high">HD Broadcast Quality (720p)</option>
                                <option value="medium">Balanced Output Rate (480p)</option>
                                <option value="low">Optimized Low-Bandwidth Mode</option>
                            </select>
                        </div>
                        <div className="space-y-2.5 flex flex-col justify-center">
                            <label className="flex items-center gap-3 text-xs font-medium cursor-pointer select-none text-slate-300">
                                <input type="checkbox" checked={noiseSuppression} onChange={(e) => setNoiseSuppression(e.target.checked)} className="accent-[#163F68] h-4 w-4 rounded" />
                                Intelligent Noise Isolation
                            </label>
                            <label className="flex items-center gap-3 text-xs font-medium cursor-pointer select-none text-slate-300">
                                <input type="checkbox" checked={echoCancellation} onChange={(e) => setEchoCancellation(e.target.checked)} className="accent-[#163F68] h-4 w-4 rounded" />
                                Acoustic Echo Cancellation
                            </label>
                            <label className="flex items-center gap-3 text-xs font-medium cursor-pointer select-none text-slate-300">
                                <input type="checkbox" checked={mirrorCamera} onChange={(e) => setMirrorCamera(e.target.checked)} className="accent-[#163F68] h-4 w-4 rounded" />
                                Mirror Local Display Feed
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2 pt-1 border-t border-slate-800/40">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <RiSparklesLine size={14} className="text-[#C99328]" /> Virtual Background Filters
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button type="button" className="p-3 rounded-xl bg-slate-950 border-2 border-[#163F68] text-center text-xs font-semibold text-slate-200">None</button>
                            <button type="button" className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500 cursor-not-allowed opacity-60">Blur Filter</button>
                            <button type="button" className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500 cursor-not-allowed opacity-60">Office Matte</button>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                    <button onClick={onClose} className="bg-[#163F68] hover:bg-[#163F68]/80 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-lg active:scale-95">
                        Apply Configuration
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// --- ENTERPRISE COMPONENT CONTROLS TOOLBAR SYSTEM ---
function FloatingControls({ 
    onToggleChat, isChatOpen, 
    onToggleParticipants, isParticipantsOpen, 
    onToggleTimer, isTimerOpen, 
    onToggleHand, hasHandRaised, 
    onToggleSettings, timerConfig 
}) {
    const room = useRoomContext();
    const [micOn, setMicOn] = useState(room.localParticipant.isMicrophoneEnabled);
    const [camOn, setCamOn] = useState(room.localParticipant.isCameraEnabled);
    const [screenOn, setScreenOn] = useState(room.localParticipant.isScreenShareEnabled);

    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);

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
                    a.download = `Meeting-Recording-${Date.now()}.webm`;
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
                console.error("Local screen recording resource generation aborted.", err);
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

    return (
        <div className="h-24 bg-slate-900 border-t border-slate-800 grid grid-cols-3 items-center px-8 text-white select-none z-30 relative shadow-xl">
            
            {/* LEFT AREA SECTION */}
            <div className="flex items-center gap-2">
                {isRecording && (
                    <div className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest font-mono shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                        REC {formatTime(recordingTime)}
                    </div>
                )}
                {timerConfig.isActive && (
                    <div className="flex items-center gap-1.5 bg-[#C99328]/10 border border-[#C99328]/30 text-[#C99328] px-3 py-1.5 rounded-full text-[10px] font-bold font-mono shadow-sm">
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

            {/* CENTER CONTROL AREA SECTION */}
            <div className="flex items-center justify-center gap-3">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleMic} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border border-slate-800/80 shadow-md ${micOn ? "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white" : "bg-[#EF4444] text-white hover:bg-[#EF4444]/90"}`}>
                    {micOn ? <RiMicLine size={18}/> : <RiMicOffLine size={18}/>}
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleCamera} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border border-slate-800/80 shadow-md ${camOn ? "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white" : "bg-[#EF4444] text-white hover:bg-[#EF4444]/90"}`}>
                    {camOn ? <RiVideoLine size={18}/> : <RiVideoOffLine size={18}/>}
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleScreen} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border border-slate-800/80 shadow-md ${screenOn ? "bg-[#163F68] text-white hover:bg-[#163F68]/90" : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"}`}>
                    <RiComputerLine size={18}/>
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onToggleHand} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border border-slate-800/80 shadow-md ${hasHandRaised ? "bg-[#C99328] text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"}`}>
                    <RiHand size={18}/>
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onToggleTimer} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border border-slate-800/80 shadow-md ${isTimerOpen ? "bg-[#163F68] text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"}`}>
                    <RiTimerLine size={18}/>
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleToggleRecording} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border border-slate-800/80 shadow-md ${isRecording ? "bg-[#EF4444] text-white animate-pulse border-transparent" : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"}`}>
                    <RiRecordCircleLine size={18}/>
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { room.disconnect(); window.close(); }} className="w-14 h-11 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white rounded-full flex items-center justify-center transition-all shadow-lg border border-transparent ml-2">
                    <RiPhoneFill size={19}/>
                </motion.button>
            </div>

            {/* RIGHT SIDEBAR TRIGGER AREA SECTION */}
            <div className="flex items-center justify-end gap-3">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onToggleParticipants} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border border-slate-800/80 shadow-md ${isParticipantsOpen ? "bg-[#163F68] text-white border-transparent" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"}`}>
                    <RiGroupLine size={18}/>
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onToggleChat} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border border-slate-800/80 shadow-md ${isChatOpen ? "bg-[#163F68] text-white border-transparent" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"}`}>
                    <RiChat3Line size={18}/>
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onToggleSettings} className="w-11 h-11 rounded-xl flex items-center justify-center transition-all border border-slate-800/80 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md">
                    <RiSettings3Line size={18}/>
                </motion.button>
            </div>

        </div>
    );
}

// --- SECURE WORKSPACE MEETING ROOT CONTAINER ENVIRONMENT ---
function MeetingRoomContent() {
    const room = useRoomContext();
    const [activePanel, setActivePanel] = useState(null); // 'chat' | 'participants' | 'timer' | null
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [raisedHands, setRaisedHands] = useState([]);
    
    const [timerConfig, setTimerConfig] = useState({
        isActive: false,
        total: 0,
        remaining: 0
    });

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

    const handleStartTimer = (durationSeconds) => {
        const payload = JSON.stringify({
            type: "timer_start",
            duration: durationSeconds,
            stamp: Date.now()
        });
        const data = new TextEncoder().encode(payload);
        room.localParticipant.publishData(data, { reliable: true });

        setTimerConfig({
            isActive: true,
            total: durationSeconds,
            remaining: durationSeconds
        });
    };

    const handleCancelTimer = () => {
        const payload = JSON.stringify({ type: "timer_stop" });
        const data = new TextEncoder().encode(payload);
        room.localParticipant.publishData(data, { reliable: true });

        setTimerConfig({ isActive: false, total: 0, remaining: 0 });
    };

    // --- COUNTDOWN SCHEDULER EFFECT ---
    useEffect(() => {
        let interval = null;
        if (timerConfig.isActive && timerConfig.remaining > 0) {
            interval = setInterval(() => {
                setTimerConfig(prev => {
                    if (prev.remaining <= 1) {
                        clearInterval(interval);
                        playAlertSound();
                        return { isActive: false, total: 0, remaining: 0 };
                    }
                    return { ...prev, remaining: prev.remaining - 1 };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerConfig.isActive, timerConfig.remaining]);

    // --- DATA BROADCAST CHANNEL SYNC SUBSCRIPTION ---
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
                            remaining: rem
                        });
                    }
                } else if (data.type === "timer_stop") {
                    setTimerConfig({ isActive: false, total: 0, remaining: 0 });
                }
            } catch (e) {
               console.error("Data tracking process runtime mapping exception", e);
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
            
            {/* BRANDING HEADER BACKGROUND CONTAINER AREA */}
            <div className="absolute top-5 left-6 z-50 flex items-center gap-3 bg-slate-950/40 backdrop-blur-sm pr-4 pl-2 py-1.5 rounded-2xl border border-slate-800/30">
                <div className="w-10 h-10 rounded-xl bg-[#163F68] flex items-center justify-center shadow-md border border-white/10">
                    <RiShieldCheckLine className="text-[#C99328] text-lg" />
                </div>
                <div>
                    <h2 className="text-white text-sm font-black tracking-wider leading-none">SHNOOR</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Workspace Meet</p>
                </div>
            </div>

            <RoomAudioRenderer />
            
            <div className="flex flex-1 w-full h-[calc(100vh-96px)] overflow-hidden relative">
                
                {/* VIDEO TILES AREA */}
                <ActiveVideoGrid raisedHands={raisedHands} />
                
                {/* SLIDING ENHANCED RIGHT SIDEBAR SYSTEM */}
                <AnimatePresence mode="wait">
                    {activePanel === 'chat' && (
                        <RightChatPanel key="chat" isOpen={true} onClose={() => setActivePanel(null)} />
                    )}
                    {activePanel === 'participants' && (
                        <ParticipantsSidebar key="participants" isOpen={true} onClose={() => setActivePanel(null)} raisedHands={raisedHands} />
                    )}
                    {activePanel === 'timer' && (
                        <PresentationTimerPanel 
                            key="timer" 
                            isOpen={true} 
                            onClose={() => setActivePanel(null)} 
                            timerConfig={timerConfig}
                            onStartTimer={handleStartTimer}
                            onCancelTimer={handleCancelTimer}
                        />
                    )}
                </AnimatePresence>
            </div>

            <FloatingControls 
                onToggleChat={() => togglePanel('chat')} 
                isChatOpen={activePanel === 'chat'} 
                onToggleParticipants={() => togglePanel('participants')}
                isParticipantsOpen={activePanel === 'participants'}
                onToggleTimer={() => togglePanel('timer')}
                isTimerOpen={activePanel === 'timer'}
                onToggleHand={toggleHandRaise}
                hasHandRaised={hasHandRaised}
                onToggleSettings={() => setIsSettingsOpen(true)}
                timerConfig={timerConfig}
            />

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
}

// --- OUTER BOOTSTRAPPING CONTROLLER CONTAINER ---
export default function MeetingRoom() {
    const params = useMemo(() => new URLSearchParams(window.location.search), []);
    const roomName = params.get("room");
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
                        participantName: currentUser.full_name || "Enterprise Workspace User",
                    }
                );
                setToken(res.data.token);
                setServerUrl(res.data.url);
            } catch(err){
                console.error("Token ingestion server request failed", err);
            } finally{
                setLoading(false);
            }
        }
        if (roomName) {
            loadToken();
        }
    }, [roomName, currentUser.full_name]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
                <div className="w-9 h-9 border-4 border-[#163F68] border-t-[#C99328] rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Securing Live Room Connection Layer...</p>
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