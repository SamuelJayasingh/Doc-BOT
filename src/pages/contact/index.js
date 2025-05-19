"use client";
import Link from 'next/link';
import {
    FiMapPin,
    FiHome,
    FiClock,
    FiInstagram,
    FiMessageSquare,
    FiZap,
    FiUsers,
    FiTarget
} from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// --- Header Component (Remains the same) ---
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
                <span>{isClient ? new Intl.DateTimeFormat().resolvedOptions().timeZone : 'Loading...'}</span>
            </div>

            <nav className="flex bg-white/5 border border-white/10 rounded-full px-2 py-1 md:px-4 md:py-2 shadow-lg">
                <ul className="flex space-x-2 md:space-x-6 items-center">
                    <li>
                        <Link href="/" className="flex items-center space-x-1 md:space-x-2 text-gray-200 hover:text-emerald-400 transition group">
                            <FiHome className="h-4 w-4 transition-transform group-hover:scale-110" />
                            <span className="hidden md:inline text-sm font-medium">Home</span>
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

// --- Renamed and Enhanced Call to Action Component ---
function ContactPrompt() {
    const instagram = {
        icon: FiInstagram,
        href: "https://www.instagram.com/freelance.tech",
        label: "Contact me on Instagram"
    };

    const variants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i = 1) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.2,
                duration: 0.6,
                ease: "easeOut"
            }
        })
    };

    return (
        <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={variants}
            className="w-full max-w-xl mt-12 md:mt-16 text-center px-4 mx-auto bg-white/5 border border-white/10 rounded-lg p-6 md:p-8 shadow-xl"
        >
            <h3 className="text-xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
                Ready to Build Your AI Assistant?
            </h3>
            <p className="text-gray-300 md:text-lg mb-6 leading-relaxed">
                Let's collaborate! Reach out directly to discuss your specific needs and explore how a custom AI chatbot can transform your project or business.
            </p>
            <p className="text-gray-400 text-sm mb-5 font-medium">Connect with me via Instagram:</p>

            <motion.a
                href={instagram.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={instagram.label}
                whileHover={{ scale: 1.1, y: -3, color: '#E1306C' }}
                whileTap={{ scale: 0.95 }}
                className="inline-block text-gray-300 hover:text-pink-500 transition text-5xl md:text-6xl"
            >
                <instagram.icon />
            </motion.a>
            <p className="text-xs text-gray-500 mt-4 italic">Tap the icon to start the conversation!</p>
        </motion.div>
    );
}

// --- Main Page Component ---
export default function ContactPage() {

    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: (i = 1) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.15,
                duration: 0.7,
                ease: "easeOut"
            }
        })
    };

    const benefits = [
        { icon: FiMessageSquare, title: "Enhanced Engagement", description: "Provide instant, 24/7 responses and personalized interactions." },
        { icon: FiZap, title: "Increased Efficiency", description: "Automate repetitive tasks like answering FAQs, qualifying leads, or scheduling." },
        { icon: FiUsers, title: "Improved User Experience", description: "Guide users, offer support, and make information easily accessible." },
    ];

    return (
        <div className="bg-gradient-to-br from-gray-950 via-black to-indigo-950 min-h-screen flex flex-col items-center text-white overflow-x-hidden relative font-sans">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('/circuit-board.svg')] bg-repeat mask-image:[radial-gradient(ellipse_at_center,white_10%,transparent_70%)]"></div>
            <div className="absolute inset-0 opacity-20 mix-blend-overlay animate-pulse bg-gradient-to-tr from-emerald-900 via-transparent to-purple-900 duration-[5000ms]"></div>

            <Header />

            <main className="flex-grow flex flex-col justify-center items-center w-full px-4 md:px-6 pb-16 pt-28 md:pt-36 z-10">

                <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="text-center mb-12 md:mb-16 max-w-3xl mx-auto"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 leading-tight">
                        Unlock the Power of Conversational AI
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                        Build intelligent, custom AI chatbots designed to elevate your customer interactions, streamline operations, and drive growth for your unique use case.
                    </p>
                </motion.div>

                <motion.div
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="w-full max-w-4xl mx-auto mb-12 md:mb-16"
                >
                    <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 text-gray-200">Why Choose an AI Chatbot?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-6 text-center hover:bg-white/10 transition duration-300">
                                <benefit.icon className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-100 mb-2">{benefit.title}</h3>
                                <p className="text-sm text-gray-400">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="w-full max-w-3xl mx-auto mb-12 md:mb-16 text-center"
                >
                    <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-200">Tailored to Your Vision</h2>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 bg-white/5 border border-white/10 rounded-lg p-6">
                        <FiTarget className="h-12 w-12 text-purple-400 mb-4 md:mb-0 md:mr-4 flex-shrink-0"/>
                        <p className="text-gray-300 md:text-lg leading-relaxed md:text-left">
                            Whether you need a sophisticated customer service agent, a dynamic lead generator, an internal knowledge base assistant, or something completely unique – I build AI chatbots meticulously crafted to meet <span className="font-semibold text-emerald-300">your specific goals</span>. We'll work together to bring your conversational AI concept to life.
                        </p>
                    </div>
                </motion.div>
                <ContactPrompt />

            </main>

            <footer className="w-full text-center p-4 text-xs text-gray-500 z-10 relative mt-auto">
                 © {new Date().getFullYear()} Doc-BOT
                 <span className="mx-2">|</span> Samuel Jayasingh
            </footer>
        </div>
    );
}
