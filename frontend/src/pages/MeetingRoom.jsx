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
    RiEmotionLine,
    RiHand,
    RiTimerLine,
    RiRecordCircleLine,
    RiSettings3Line,
    RiGroupLine,
    RiCloseLine,
    RiVolumeUpLine
} from "react-icons/ri";

const API = import.meta.env.VITE_API_URL;

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
                    <div className="bg-[#C99328] text-white p-2 rounded-full shadow-lg animate-bounce">
                        <RiHand size={18} />
                    </div>
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

function ActiveVideoGrid({ isChatOpen, floatingEmojis, raisedHands }) {
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
                            left: `${40 + Math.random() * 20}%`,
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
                        raisedHands={raisedHands}
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
        <div className="w-80 h-[calc(100vh-96px)] bg-slate-900 border-l border-slate-800 flex flex-col z-20">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-white tracking-wide text-sm uppercase">Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-end">
                {chatMessages.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center my-auto">Messages sent here are visible to everyone.</p>
                ) : (
                    chatMessages.map((msg, index) => (
                        <div key={index} className={`flex flex-col ${msg.from?.isLocal ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-slate-400 mb-1 font-medium">{msg.from?.name || "Participant"}</span>
                            <div className={`px-3 py-2 rounded-xl text-xs max-w-[85%] break-words ${msg.from?.isLocal ? 'bg-[#163F68] text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
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
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#163F68] transition-colors"
                />
                <button type="submit" className="p-2 bg-[#163F68] hover:bg-[#163F68] rounded-xl transition text-white">
                    <RiSendPlane2Fill size={16}/>
                </button>
            </form>
        </div>
    );
}

function ParticipantsSidebar({ isOpen, raisedHands }) {
    const participants = useParticipants();
    if (!isOpen) return null;

    return (
        <div className="w-80 h-[calc(100vh-96px)] bg-slate-900 border-l border-slate-800 flex flex-col z-20 text-white">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold tracking-wide text-sm uppercase">Participants ({participants.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {participants.map((p) => (
                    <div key={p.sid} className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                        <span className="text-xs font-medium truncate max-w-[180px]">
                            {p.identity} {p.isLocal ? "(You)" : ""}
                        </span>
                        <div className="flex items-center gap-2">
                            {raisedHands.includes(p.identity) && (
                                <span className="text-[#C99328]">
                                    <RiHand size={16} />
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SettingsModal({ isOpen, onClose }) {
    const [devices, setDevices] = useState([]);
    const [videoQuality, setVideoQuality] = useState("high");
    const [noiseSuppression, setNoiseSuppression] = useState(true);
    const [mirrorCamera, setMirrorCamera] = useState(true);

    useEffect(() => {
        if (isOpen) {
            navigator.mediaDevices.enumerateDevices().then(setDevices).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in text-white">
            <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                    <h3 className="text-md font-bold uppercase tracking-wider flex items-center gap-2">
                        <RiSettings3Line className="text-[#C99328]" /> Meeting Settings
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition">
                        <RiCloseLine size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <RiVideoLine /> Camera Source
                        </label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#163F68]">
                            {devices.filter(d => d.kind === "videoinput").map(d => (
                                <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,5)}`}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <RiMicLine /> Microphone Source
                        </label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#163F68]">
                            {devices.filter(d => d.kind === "audioinput").map(d => (
                                <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0,5)}`}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <RiVolumeUpLine /> Speaker Source
                        </label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#163F68]">
                            {devices.filter(d => d.kind === "audiooutput").map(d => (
                                <option key={d.deviceId} value={d.deviceId}>{d.label || `Speaker ${d.deviceId.slice(0,5)}`}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Video Quality</label>
                            <select value={videoQuality} onChange={(e) => setVideoQuality(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#163F68]">
                                <option value="high">High Definition (720p)</option>
                                <option value="medium">Standard (360p)</option>
                                <option value="low">Low Bandwidth</option>
                            </select>
                        </div>
                        <div className="flex flex-col justify-end space-y-3 pb-1">
                            <label className="flex items-center gap-3 text-xs font-medium cursor-pointer select-none">
                                <input type="checkbox" checked={noiseSuppression} onChange={(e) => setNoiseSuppression(e.target.checked)} className="accent-[#163F68] h-4 w-4 rounded" />
                                Noise Suppression
                            </label>
                            <label className="flex items-center gap-3 text-xs font-medium cursor-pointer select-none">
                                <input type="checkbox" checked={mirrorCamera} onChange={(e) => setMirrorCamera(e.target.checked)} className="accent-[#163F68] h-4 w-4 rounded" />
                                Mirror Local Camera
                            </label>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex justify-end">
                    <button onClick={onClose} className="bg-[#163F68] hover:bg-[#163F68]/80 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

function FloatingControls({ onToggleChat, isChatOpen, onToggleParticipants, isParticipantsOpen, onToggleHand, hasHandRaised, onToggleSettings }) {
    const room = useRoomContext();
    const tracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);
    const [micOn, setMicOn] = useState(room.localParticipant.isMicrophoneEnabled);
    const [camOn, setCamOn] = useState(room.localParticipant.isCameraEnabled);
    const [screenOn, setScreenOn] = useState(room.localParticipant.isScreenShareEnabled);

    const [presentationTime, setPresentationTime] = useState(0);
    const [totalPresTime, setTotalPresTime] = useState(null);
    const isAnyScreenSharing = tracks.length > 0;

    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);

    useEffect(() => {
        let interval = null;
        if (isAnyScreenSharing) {
            setTotalPresTime(null);
            interval = setInterval(() => {
                setPresentationTime(prev => prev + 1);
            }, 1000);
        } else {
            if (presentationTime > 0) {
                setTotalPresTime(presentationTime);
            }
            setPresentationTime(0);
        }
        return () => clearInterval(interval);
    }, [isAnyScreenSharing]);

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
                console.error("Recording standard fetch canceled or failed.", err);
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
        <div className="h-24 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-8 text-white select-none z-30 relative">
            <div className="flex items-center gap-3 min-w-[200px]">
                <div className="text-sm font-medium tracking-wide truncate max-w-[160px]">
                    {room.name || "Live Workspace Session"}
                </div>
                {isAnyScreenSharing && (
                    <div className="flex items-center gap-1 bg-[#163F68] text-white px-2.5 py-1 rounded-full text-[11px] font-bold border border-slate-700">
                        <RiTimerLine className="animate-spin text-[#C99328]" />
                        <span>{formatTime(presentationTime)}</span>
                    </div>
                )}
                {!isAnyScreenSharing && totalPresTime !== null && (
                    <div className="text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        Pres: {formatTime(totalPresTime)}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button title="Microphone" onClick={toggleMic} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 border border-slate-800/60 ${micOn ? "bg-slate-800 hover:bg-slate-700" : "bg-[#EF4444] hover:bg-[#EF4444]/80"}`}>
                    {micOn ? <RiMicLine size={19}/> : <RiMicOffLine size={19}/>}
                </button>

                <button title="Camera" onClick={toggleCamera} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 border border-slate-800/60 ${camOn ? "bg-slate-800 hover:bg-slate-700" : "bg-[#EF4444] hover:bg-[#EF4444]/80"}`}>
                    {camOn ? <RiVideoLine size={19}/> : <RiVideoOffLine size={19}/>}
                </button>

                <button title="Screen Share" onClick={toggleScreen} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 border border-slate-800/60 ${screenOn ? "bg-[#163F68] hover:bg-[#163F68]/80" : "bg-slate-800 hover:bg-slate-700"}`}>
                    <RiComputerLine size={19}/>
                </button>

                <button title="Raise Hand" onClick={onToggleHand} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 border border-slate-800/60 ${hasHandRaised ? "bg-[#C99328] text-white" : "bg-slate-800 hover:bg-slate-700"}`}>
                    <RiHand size={19}/>
                </button>

                <button title="Record Session" onClick={handleToggleRecording} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 border border-slate-800/60 ${isRecording ? "bg-[#EF4444] text-white animate-pulse" : "bg-slate-800 hover:bg-slate-700"}`}>
                    <RiRecordCircleLine size={19}/>
                </button>

                <button title="Participants" onClick={onToggleParticipants} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 border border-slate-800/60 ${isParticipantsOpen ? "bg-[#163F68] text-white" : "bg-slate-800 hover:bg-slate-700"}`}>
                    <RiGroupLine size={19}/>
                </button>

                <button title="Chat" onClick={onToggleChat} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 border border-slate-800/60 ${isChatOpen ? "bg-[#163F68] text-white" : "bg-slate-800 hover:bg-slate-700"}`}>
                    <RiChat3Line size={19}/>
                </button>

                <button title="Settings" onClick={onToggleSettings} className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 border border-slate-800/60 bg-slate-800 hover:bg-slate-700">
                    <RiSettings3Line size={19}/>
                </button>

                {isRecording && (
                    <div className="flex items-center gap-1.5 bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] px-3 py-1 rounded-xl text-xs font-bold font-mono">
                        <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                        REC {formatTime(recordingTime)}
                    </div>
                )}

                <button title="Leave Meeting" onClick={() => { room.disconnect(); window.close(); }} className="w-14 h-11 bg-[#EF4444] hover:bg-[#EF4444]/80 rounded-full flex items-center justify-center transition-all border border-transparent">
                    <RiPhoneFill size={20} className="text-white"/>
                </button>
            </div>

            <div className="min-w-[120px] flex justify-end text-xs text-slate-500 font-semibold uppercase tracking-wider">
                SHNOOR Meet
            </div>
        </div>
    );
}

function MeetingRoomContent() {
    const room = useRoomContext();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [floatingEmojis, setFloatingEmojis] = useState([]);
    const [raisedHands, setRaisedHands] = useState([]);

    const hasHandRaised = raisedHands.includes(room.localParticipant.identity);

    const toggleHandRaise = () => {
        const nextState = !hasHandRaised;
        const payload = JSON.stringify({ 
            type: "hand_raise", 
            raised: nextState,
            identity: room.localParticipant.identity 
        });
        const encoder = new TextEncoder();
        const data = encoder.encode(payload);
        room.localParticipant.publishData(data, { reliable: true });

        setRaisedHands(prev => 
            nextState 
                ? [...prev, room.localParticipant.identity] 
                : prev.filter(id => id !== room.localParticipant.identity)
        );
    };

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
                } else if (data.type === "hand_raise") {
                    setRaisedHands(prev => 
                        data.raised 
                            ? [...new Set([...prev, data.identity])] 
                            : prev.filter(id => id !== data.identity)
                    );
                }
            } catch (e) {
               console.error(e);
            }
        };

        const handleParticipantDisconnected = (p) => {
            setRaisedHands(prev => prev.filter(id => id !== p.identity));
        };

        room.on("dataReceived", handleDataReceived);
        room.on("participantDisconnected", handleParticipantDisconnected);
        return () => {
            room.off("dataReceived", handleDataReceived);
            room.off("participantDisconnected", handleParticipantDisconnected);
        };
    }, [room]);

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col overflow-hidden font-sans select-none w-screen h-screen">
            <div className="absolute top-5 left-6 z-50 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#163F68] flex items-center justify-center shadow-lg hover:bg-[#C99328] transition-colors cursor-pointer border border-slate-800/50">
                    <RiVideoLine className="text-white text-xl" />
                </div>
                <div>
                    <h2 className="text-white text-xl font-bold tracking-wide">SHNOOR</h2>
                    <p className="text-slate-300 text-sm">Workspace Meet</p>
                </div>
            </div>

            <RoomAudioRenderer />
            
            <div className="flex flex-1 w-full h-[calc(100vh-96px)] overflow-hidden">
                <ActiveVideoGrid floatingEmojis={floatingEmojis} raisedHands={raisedHands} />
                <RightChatPanel isOpen={isChatOpen} />
                <ParticipantsSidebar isOpen={isParticipantsOpen} raisedHands={raisedHands} />
            </div>

            <FloatingControls 
                onToggleChat={() => { setIsChatOpen(!isChatOpen); setIsParticipantsOpen(false); }} 
                isChatOpen={isChatOpen} 
                onToggleParticipants={() => { setIsParticipantsOpen(!isParticipantsOpen); setIsChatOpen(false); }}
                isParticipantsOpen={isParticipantsOpen}
                onToggleHand={toggleHandRaise}
                hasHandRaised={hasHandRaised}
                onToggleSettings={() => setIsSettingsOpen(true)}
                onSendEmoji={sendEmojiReaction}
            />

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
}

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
                        participantName: currentUser.full_name || "Enterprise User",
                    }
                );
                setToken(res.data.token);
                setServerUrl(res.data.url);
            } catch(err){
                console.error(err);
            } finally{
                setLoading(false);
            }
        }
        loadToken();
    }, [roomName, currentUser.full_name]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
                <div className="w-10 h-10 border-4 border-[#163F68] border-t-[#C99328] rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Securing Live Room Access...</p>
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