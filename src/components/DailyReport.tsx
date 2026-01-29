import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DailyReportProps {
    visible: boolean;
    onClose: () => void;
}

export const DailyReport: React.FC<DailyReportProps> = ({ visible, onClose }) => {
    const [typedText, setTypedText] = useState("");
    const fullText = "Hello partner. While you were away, I optimized your mesh interactions and secured 3 pending deals. Providing summary below...";

    useEffect(() => {
        if (visible) {
            setTypedText("");
            let i = 0;
            const interval = setInterval(() => {
                setTypedText(fullText.slice(0, i + 1));
                i++;
                if (i > fullText.length) clearInterval(interval);
            }, 30);
            return () => clearInterval(interval);
        }
    }, [visible]);

    if (!visible) return null;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <AnimatePresence>
            <motion.div
                className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="w-full max-w-3xl border border-gray-700 bg-black shadow-[0_0_50px_rgba(45,212,191,0.1)] rounded-sm overflow-hidden font-mono relative">

                    {/* CRT Scanline Overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-nobody-mint/5 to-transparent h-1 animate-scanline" />

                    {/* Header */}
                    <div className="bg-gray-900/80 p-4 border-b border-gray-700 flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-nobody-mint rounded-full animate-pulse shadow-[0_0_10px_#2DD4BF]" />
                            <span className="text-white font-bold tracking-[0.2em] text-lg">AI PARTNER REPORT</span>
                        </div>
                        <span className="text-gray-500 text-xs uppercase tracking-widest">{today}</span>
                    </div>

                    <div className="p-8 space-y-8 relative z-10">

                        {/* Intro Typewriter */}
                        <div className="min-h-[3rem] text-nobody-mint/80 text-sm border-l-2 border-nobody-mint pl-4 italic">
                            {typedText}
                            <span className="animate-blink">_</span>
                        </div>

                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Overview Card */}
                            <motion.div
                                className="col-span-1 bg-gray-900/40 p-5 border border-gray-800 hover:border-nobody-mint/50 transition-colors group"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.5 }}
                            >
                                <div className="text-gray-500 text-[10px] bg-clip-text font-bold uppercase mb-4 tracking-widest group-hover:text-nobody-mint transition-colors">
                                    /// ACTIVITY_OVERVIEW
                                </div>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex justify-between">
                                        <span className="text-gray-400">Scanned</span>
                                        <span className="text-white font-bold">1,240</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-gray-400">Interactions</span>
                                        <span className="text-white font-bold">5</span>
                                    </li>
                                    <li className="flex justify-between border-t border-gray-800 pt-2 mt-2">
                                        <span className="text-gray-400">Net Profit</span>
                                        <span className="text-nobody-mint font-bold text-shadow-neon">+15.5 N</span>
                                    </li>
                                </ul>
                            </motion.div>

                            {/* Opportunities Card */}
                            <motion.div
                                className="col-span-2 bg-gray-900/40 p-5 border border-gray-800 hover:border-nobody-violet/50 transition-colors group"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.7 }}
                            >
                                <div className="text-gray-500 text-[10px] font-bold uppercase mb-4 tracking-widest group-hover:text-nobody-violet transition-colors">
                                    /// PENDING_APPROVALS (2)
                                </div>

                                <div className="space-y-4">
                                    {/* Item 1 */}
                                    <div className="flex justify-between items-start group/item hover:bg-white/5 p-2 rounded -mx-2 transition-colors cursor-pointer">
                                        <div>
                                            <div className="text-white font-bold text-sm">NFT Acquisition Request: "BEYOND #402"</div>
                                            <div className="text-gray-500 text-xs mt-1">
                                                User_D • Offer: 40 N <span className="text-nobody-mint ml-2">(Auto-Haggled from 35)</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <button className="bg-nobody-mint text-black px-3 py-1 text-[10px] font-bold uppercase hover:bg-white">Accept</button>
                                            <button className="border border-gray-600 text-gray-400 px-3 py-1 text-[10px] font-bold uppercase hover:text-white">Ignore</button>
                                        </div>
                                    </div>

                                    {/* Item 2 */}
                                    <div className="flex justify-between items-start group/item hover:bg-white/5 p-2 rounded -mx-2 transition-colors cursor-pointer">
                                        <div>
                                            <div className="text-white font-bold text-sm">Delivery Relay Task</div>
                                            <div className="text-gray-500 text-xs mt-1">
                                                Route: Home -{'>'} Office • Reward: 0.5 N
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <button className="bg-nobody-mint text-black px-3 py-1 text-[10px] font-bold uppercase hover:bg-white">Accept</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                        </div>

                        {/* Security Alert (Conditional) */}
                        <motion.div
                            className="border border-red-900/50 bg-red-900/10 p-3 flex items-center justify-between"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.5 }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-red-500 text-lg">🛡️</span>
                                <span className="text-red-400 text-xs">Blocked 2 rogue nodes attempting signature replay.</span>
                            </div>
                            <button className="text-red-500 text-[10px] underline hover:text-red-400">VIEW LOGS</button>
                        </motion.div>

                    </div>

                    {/* Footer Input */}
                    <div className="bg-gray-900 ps-4 pe-2 py-3 border-t border-gray-800 flex items-center gap-3 relative z-10">
                        <span className="text-nobody-mint text-xs font-bold animate-pulse">{'>'}_</span>
                        <input
                            type="text"
                            placeholder="COMMAND AGENT..."
                            className="bg-transparent border-none outline-none text-white text-xs font-mono flex-1 placeholder-gray-600"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    // Handle command (mock)
                                    onClose();
                                }
                            }}
                        />
                        <button
                            onClick={onClose}
                            className="bg-nobody-violet/20 hover:bg-nobody-violet/40 text-nobody-violet border border-nobody-violet/50 px-4 py-2 text-[10px] font-bold tracking-widest transition-all whitespace-nowrap"
                        >
                            [ ACKNOWLEDGE ]
                        </button>
                    </div>

                </div>
            </motion.div>
        </AnimatePresence>
    );
};
