"use client";
import Link from 'next/link';
import {
    FiUser,
    FiMail,
    FiLogIn,
    FiHome,
    FiMic,
    FiSquare,
    FiSend,
    FiClock,
    FiMapPin
} from 'react-icons/fi';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Modern Header ---
function Header() {
    const [time, setTime] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const updateClock = () => {
            setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }));
        };
        updateClock();
        const interval = setInterval(updateClock, 1000 * 60);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full p-3 md:p-6 bg-black/30 backdrop-blur-lg border-b border-white/10"
        >
            <div className="hidden sm:flex items-center space-x-2 text-gray-400 text-xs md:text-sm">
                <FiMapPin className="h-3 w-3 md:h-4 md:w-4" />
                <span>Asia/Jakarta</span>
            </div>

            <nav className="flex bg-white/5 border border-white/10 rounded-full px-2 py-1 md:px-4 md:py-2 shadow-lg">
                <ul className="flex space-x-2 md:space-x-6 items-center">
                    <li>
                        <Link href="/" className="flex items-center space-x-1 md:space-x-2 text-gray-200 hover:text-emerald-400 transition group">
                            <FiHome className="h-4 w-4 transition-transform group-hover:scale-110" />
                            <span className="hidden md:inline text-sm font-medium">Home</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/contact" className="flex items-center space-x-1 md:space-x-2 text-gray-200 hover:text-emerald-400 transition group">
                            <FiMail className="h-4 w-4 transition-transform group-hover:scale-110" />
                            <span className="hidden md:inline text-sm font-medium">Contact</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="flex items-center space-x-2 text-gray-400 text-xs md:text-sm font-mono">
                <FiClock className="h-3 w-3 md:h-4 md:w-4" />
                <span>{isClient ? time : '00:00'}</span>
            </div>
        </motion.header>
    );
}

// --- Modern ChatBubble ---
function ChatBubble({ sender, message }) {
    const isUser = sender === "user";
    const variants = {
        hidden: { opacity: 0, y: 10, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 px-1`}
        >
            <div className={`max-w-[85%] md:max-w-[75%] px-4 py-2.5 rounded-xl shadow-md text-sm md:text-base leading-relaxed
                ${isUser
                    ? 'bg-gradient-to-br from-emerald-500/80 to-teal-600/80 text-white backdrop-blur-sm rounded-br-none'
                    : 'bg-white/10 text-gray-200 backdrop-blur-sm border border-white/10 rounded-bl-none'
                }
            `}>
                {message}
            </div>
        </motion.div>
    );
}

// --- Modern GlassChat ---
function GlassChat() {
    const [messages, setMessages] = useState([
        { sender: "bot", message: "Hello! I am Doc-BOT ✨" },
        { sender: "bot", message: "You can type a message or use the microphone to speak." }
    ]);
    const [input, setInput] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const chatContainerRef = useRef(null);
    const audioContextRef = useRef(null);
    const processorRef = useRef(null);
    const streamRef = useRef(null);
    const pcmDataRef = useRef([]);
    const lastMessageRef = useRef(null);
    const [conversationHistory, setConversationHistory] = useState("");

    useEffect(() => {
        if (chatContainerRef.current) {
            requestAnimationFrame(() => {
                chatContainerRef.current.scrollTo({
                    top: chatContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            });
        }
    }, [messages]);

    useEffect(() => {
        const formattedHistory = messages.map(msg =>
            `${msg.sender === "user" ? "User" : "assistant"}: "${msg.message}"`
        ).join("\n");

        setConversationHistory(formattedHistory);
    }, [messages]);

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.focus();
        }
    }, [messages]);

    const playAudioStream = async (response) => {
        if (!response || !response.body || !response.body.getReader) {
            console.error("Invalid response object for audio playback.");
            setMessages((prev) => [
                ...prev,
                { sender: "bot", message: "Sorry, there was an issue playing back the audio response." }
            ]);
            return;
        }

        const mediaSource = new MediaSource();
        const audio = new Audio();
        audio.src = URL.createObjectURL(mediaSource);
        audio.play().catch(e => console.error("Audio play failed:", e));

        mediaSource.addEventListener("sourceopen", async () => {
            if (mediaSource.readyState !== 'open') {
                console.error("MediaSource not open. State:", mediaSource.readyState);
                return;
            }
            try {
                const mimeType = 'audio/mpeg';
                if (!MediaSource.isTypeSupported(mimeType)) {
                    console.error(`MIME type ${mimeType} not supported`);
                    setMessages((prev) => [
                        ...prev,
                        { sender: "bot", message: "Audio format not supported by your browser." }
                    ]);
                    return;
                }
                const sourceBuffer = mediaSource.addSourceBuffer(mimeType);

                const reader = response.body.getReader();

                let appendQueue = [];
                let isAppending = false;

                sourceBuffer.addEventListener('updateend', () => {
                    isAppending = false;
                    if (appendQueue.length > 0) {
                        appendNextChunk();
                    } else if (mediaSource.readyState === 'open' && reader === null) {
                        mediaSource.endOfStream();
                    }
                });

                const appendNextChunk = () => {
                    if (!isAppending && appendQueue.length > 0) {
                        isAppending = true;
                        const chunk = appendQueue.shift();
                        try {
                            sourceBuffer.appendBuffer(chunk);
                        } catch (e) {
                            console.error("Error appending buffer:", e);
                            isAppending = false;
                        }
                    }
                };

                const pump = async () => {
                    try {
                        const { value, done } = await reader.read();
                        if (done) {
                            if (appendQueue.length === 0 && !isAppending) {
                                if (mediaSource.readyState === 'open') {
                                    mediaSource.endOfStream();
                                }
                            }
                            return;
                        }

                        appendQueue.push(value);
                        appendNextChunk();

                        await pump();
                    } catch (error) {
                        console.error("Error reading stream:", error);
                        if (mediaSource.readyState === 'open') {
                        }
                    }
                };

                await pump();

            } catch (e) {
                console.error("Error setting up MediaSource:", e);
                 setMessages((prev) => [
                    ...prev,
                    { sender: "bot", message: "Failed to setup audio playback." }
                ]);
            }
        });

        mediaSource.addEventListener("error", (e) => console.error("MediaSource error:", e));
        mediaSource.addEventListener("sourceclose", () => console.log("MediaSource closed."));
    };

    const handleSendText = async () => {
        if (input.trim() === "" || isLoading) return;

        const userMessage = input;
        setMessages((prev) => [
            ...prev,
            { sender: "user", message: userMessage },
        ]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: userMessage,
                    history: conversationHistory
                }),
            });

            if (!response.ok) {
                let errorMsg = `Network error: ${response.status}`;
                try {
                    const errData = await response.json();
                    errorMsg = errData.error || errData.message || errorMsg;
                } catch (e) { /* Ignore parsing error */ }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            const aiResponseText = data.response || "Received response, but no text content.";

            setMessages((prev) => [
                ...prev,
                { sender: "bot", message: aiResponseText }
            ]);

        } catch (error) {
            console.error("Error sending text message:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", message: `Sorry, couldn't connect: ${error.message}` }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey && !isLoading && !isRecording) {
            e.preventDefault();
            handleSendText();
        }
    };

    const startRecording = async () => {
        if (isLoading) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            await audioContextRef.current.audioWorklet.addModule('/audioProcessor.js');
            const source = audioContextRef.current.createMediaStreamSource(stream);
            const processorNode = new AudioWorkletNode(audioContextRef.current, 'audio-processor');

            pcmDataRef.current = [];
            streamRef.current = stream;

            processorNode.port.onmessage = (event) => {
                if (event.data.type === 'audioData') {
                    pcmDataRef.current.push(event.data.buffer);
                }
            };

            source.connect(processorNode);
            processorNode.connect(audioContextRef.current.destination);
            processorRef.current = processorNode;

            setIsRecording(true);
        } catch (err) {
            console.error("Mic error:", err);
            alert("Could not access microphone. Please ensure permission is granted and the audio worklet file exists.");
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (!isRecording) return;
        setIsRecording(false);
        setIsLoading(true);

        processorRef.current?.port.postMessage({ command: 'stop' });
        processorRef.current?.disconnect();
        audioContextRef.current?.close().catch(e => console.error("Error closing AudioContext:", e));
        streamRef.current?.getTracks().forEach(track => track.stop());

        setTimeout(() => {
            if (pcmDataRef.current.length === 0) {
                console.warn("No audio data captured.");
                setMessages((prev) => [...prev, { sender: "bot", message: "No audio was recorded." }]);
                setIsLoading(false);
                return;
            }
            const merged = mergeBuffers(pcmDataRef.current);
            const wavBuffer = encodeWAV(merged, audioContextRef.current?.sampleRate || 44100);
            const blob = new Blob([wavBuffer], { type: 'audio/wav' });
            sendAudioToBackend(blob);
        }, 100);
    };

    function mergeBuffers(buffers) {
        const length = buffers.reduce((sum, b) => sum + b.length, 0);
        const result = new Float32Array(length);
        let offset = 0;
        buffers.forEach(buffer => {
            result.set(buffer, offset);
            offset += buffer.length;
        });
        return result;
    }

    function encodeWAV(samples, sampleRate) {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);

        floatTo16BitPCM(view, 44, samples);

        return view.buffer;
    }

    function writeString(view, offset, str) {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    }

    function floatTo16BitPCM(output, offset, input) {
        for (let i = 0; i < input.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }

    const sendAudioToBackend = async (audioBlob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');
        formData.append('history', conversationHistory);

        try {
            const response = await fetch('http://localhost:5000/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMsg = `Audio upload failed: ${response.status}`;
                try {
                    const errData = await response.json();
                    errorMsg = errData.error || errData.message || errorMsg;
                } catch (e) { /* Ignore parsing error */ }
                throw new Error(errorMsg);
            }

            let transcribedText = response.headers.get('X-Transcribed-Text');
            if (transcribedText) {
                transcribedText = decodeURIComponent(transcribedText);
            }

            const responseCloneForAudio = response.clone();
            const responseCloneForJson = response;

            let aiResponseText = "";
            let isAudioResponse = false;

            const contentType = response.headers.get('Content-Type');

            if (contentType && contentType.includes('application/json')) {
                 try {
                    const responseData = await responseCloneForJson.json();
                    aiResponseText = responseData.aiResponse || responseData.response || "";
                    if (responseData.transcribed_text && !transcribedText) {
                        transcribedText = responseData.transcribed_text;
                    }
                 } catch (e) {
                    console.error("Error parsing JSON response after audio upload:", e);
                 }
            }

            if (!aiResponseText) {
                 const aiHeader = response.headers.get('X-AI-Response-Text');
                 if (aiHeader) {
                     aiResponseText = decodeURIComponent(aiHeader);
                 }
            }

            if (!transcribedText) {
                transcribedText = "[Voice Input]";
            }

             setMessages((prev) => [
                ...prev,
                { sender: "user", message: transcribedText },
            ]);

            if (contentType && (contentType.startsWith('audio/') || contentType === 'application/octet-stream')) {
                isAudioResponse = true;
            }

            if (aiResponseText) {
                 setMessages((prev) => [
                    ...prev,
                    { sender: "bot", message: aiResponseText }
                ]);
            } else if (!isAudioResponse) {
                 setMessages((prev) => [
                    ...prev,
                    { sender: "bot", message: "Processed audio, but no text response received." }
                ]);
            }

            if (isAudioResponse) {
                await playAudioStream(responseCloneForAudio);
            }

        } catch (error) {
            console.error("Error sending/processing audio:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", message: `Audio error: ${error.message}` }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-2xl mx-auto mt-16 md:mt-28 flex-grow flex flex-col bg-gradient-to-br from-gray-900/60 to-black/60 border border-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden"
        >
            <div
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto p-3 md:p-6 space-y-3 overscroll-contain"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.2) transparent'
                }}
            >
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            ref={idx === messages.length - 1 ? lastMessageRef : null}
                            tabIndex={idx === messages.length - 1 ? -1 : undefined}
                        >
                            <ChatBubble sender={msg.sender} message={msg.message} />
                        </div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <div className="flex justify-center items-center py-3">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-5 w-5 border-t-2 border-b-2 border-emerald-400 rounded-full"
                        ></motion.div>
                    </div>
                )}
            </div>

            <div className="p-3 md:p-6 border-t border-white/10 bg-black/30">
                <div className="flex space-x-2 items-center">
                    <input
                        type="text"
                        placeholder={isRecording ? "Recording... Click mic to stop" : "Ask me anything..."}
                        className="flex-grow px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base rounded-full bg-white/5 text-gray-200 placeholder-gray-500 backdrop-blur-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition duration-200 disabled:opacity-60"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isRecording || isLoading}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleVoiceClick}
                        disabled={isLoading && !isRecording}
                        className={`p-2 md:p-2.5 rounded-full text-white transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${isRecording ? 'bg-red-600/70 animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}
                        aria-label={isRecording ? "Stop recording" : "Start voice input"}
                    >
                        {isRecording ? <FiSquare className="h-4 w-4 md:h-5 md:w-5" /> : <FiMic className="h-4 w-4 md:h-5 md:w-5" />}
                    </motion.button>

                </div>
            </div>
            <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSendText}
                        disabled={isRecording || isLoading || input.trim() === ""}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-2 md:px-4 md:py-2.5 rounded-full font-medium text-sm shadow-md transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                       <FiSend className="h-4 w-4 md:h-5 md:w-5"/>
                    </motion.button>
        </motion.div>
    );
}

// --- Main Home Component ---
export default function Home() {

    const introVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.2,
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-950 via-black to-indigo-950 min-h-screen flex flex-col items-center text-white overflow-hidden relative font-sans">
            <div className="absolute inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center mask-image:[radial-gradient(ellipse_at_center,white_5%,transparent_60%)]"></div>

            <Header />

            <main className="flex-grow flex flex-col items-center justify-center w-full px-4 md:px-6 pb-12 pt-28 md:pt-32 z-10">

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={introVariants}
                    className="text-center max-w-xl md:max-w-2xl mb-8 md:mb-10"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-500">
                        Welcome to Doc-BOT AI Chat
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
                        Engage with our intelligent assistant. Ask questions, explore capabilities, or simply start a conversation below.
                    </p>
                     <p className="text-sm text-gray-500 mt-3 italic">
                        Type your message in the chat window to begin.
                     </p>
                </motion.div>

                <div className="w-full max-w-2xl lg:max-w-3xl">
                    <GlassChat />
                </div>

            </main>

            <footer className="w-full text-center p-4 text-xs text-gray-500 z-10 relative">
                 © {new Date().getFullYear()} Doc-BOT
                    <span className="mx-2">|</span> <Link href="/contact" className="hover:text-gray-300">Contact Us</Link>
            </footer>
        </div>
    );
}
