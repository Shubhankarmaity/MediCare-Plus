import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { Phone, Mic, MicOff, Video, VideoOff } from "lucide-react";


const VideoCall = ({ socket, user, partnerId, incomingSignal, isInitiator, onEnd }) => {
    const [stream, setStream] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    const endCall = React.useCallback(() => {
        socket.emit("endCall", { to: partnerId });
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        onEnd();
    }, [socket, partnerId, stream, onEnd]);

    useEffect(() => {
        let stream = null;
        let canceled = false; // Flag to prevent stale updates

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                if (canceled) {
                    // Check if component unmounted while waiting for media
                    currentStream.getTracks().forEach(track => track.stop());
                    return;
                }

                stream = currentStream;
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }

                if (isInitiator) {
                    const peer = new Peer({
                        initiator: true,
                        trickle: false,
                        stream: currentStream,
                    });

                    peer.on("signal", (data) => {
                        socket.emit("callUser", {
                            userToCall: partnerId,
                            signalData: data,
                            from: user._id,
                            name: user.name,
                        });
                    });

                    peer.on("stream", (remoteStream) => {
                        if (userVideo.current) {
                            userVideo.current.srcObject = remoteStream;
                        }
                    });

                    socket.on("callAccepted", (signal) => {
                        setCallAccepted(true);
                        peer.signal(signal);
                    });

                    connectionRef.current = peer;

                } else {
                    setCallAccepted(true);
                    const peer = new Peer({
                        initiator: false,
                        trickle: false,
                        stream: currentStream,
                    });

                    peer.on("signal", (data) => {
                        socket.emit("answerCall", { signal: data, to: partnerId });
                    });

                    peer.on("stream", (remoteStream) => {
                        if (userVideo.current) {
                            userVideo.current.srcObject = remoteStream;
                        }
                    });

                    peer.signal(incomingSignal);

                    connectionRef.current = peer;
                }
            })
            .catch((err) => {
                if (!canceled) {
                    console.error("Failed to get media", err);
                    onEnd();
                }
            });

        // Common socket listener for ending call
        socket.on("callEnded", () => {
            endCall();
        });

        return () => {
            canceled = true; // Mark as canceled
            socket.off("callAccepted");
            socket.off("callEnded");
            if (connectionRef.current) {
                connectionRef.current.destroy();
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [socket, isInitiator, partnerId, user._id, user.name, incomingSignal, endCall]);

    return (
        <div className="fixed inset-0 z-[1400] bg-black/80 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">

                {/* Remote Video (Main) */}
                <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                    {callAccepted && (
                        <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                    )}
                    {!callAccepted && isInitiator && (
                        <div className="text-white text-xl animate-pulse">Calling Patient...</div>
                    )}
                    {!callAccepted && !isInitiator && (
                        <div className="text-white text-xl">Connecting...</div>
                    )}
                </div>

                {/* Local Video (PIP) */}
                <div className="absolute top-4 right-4 w-48 aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-white/20">
                    <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                </div>

                {/* Controls */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 bg-gray-800/80 backdrop-blur-md p-3 rounded-full border border-gray-700 shadow-xl">
                    <button onClick={toggleMic} className={`p-4 rounded-full transition-colors ${micOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                        {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>

                    <button onClick={toggleVideo} className={`p-4 rounded-full transition-colors ${videoOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                        {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
                    </button>

                    <button onClick={endCall} className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg">
                        <Phone size={24} className="rotate-[135deg]" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCall;
