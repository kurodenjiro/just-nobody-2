import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RelayerStatusProps {
    isRelaying: boolean;
    onToggle: (enabled: boolean) => void;
}

export const RelayerStatus: React.FC<RelayerStatusProps> = ({ isRelaying, onToggle }) => {
    const [traffic, setTraffic] = useState("0 KB");
    const [earnings, setEarnings] = useState("0.0000 SOL");
    const [activeConnections, setActiveConnections] = useState(0);

    // Simulate Relayer Activity
    useEffect(() => {
        if (!isRelaying) return;

        const interval = setInterval(() => {
            // Randomly simulate traffic spikes and earnings
            const trafficSpike = Math.random() > 0.7;
            if (trafficSpike) {
                setTraffic(prev => {
                    const current = parseFloat(prev.split(" ")[0]);
                    return (current + (Math.random() * 0.5)).toFixed(2) + " MB";
                });

                setEarnings(prev => {
                    const current = parseFloat(prev.split(" ")[0]);
                    return (current + 0.0005).toFixed(4) + " SOL";
                });

                setActiveConnections(Math.floor(Math.random() * 5) + 1);
            } else {
                setActiveConnections(Math.max(1, activeConnections - 1));
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [isRelaying, activeConnections]);

    return (
        <div className="border border-gray-700 bg-black/40 p-4 relative overflow-hidden">
            {/* Background Glow when Active */}
            <AnimatePresence>
                {isRelaying && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-nobody-mint z-0"
                    />
                )}
            </AnimatePresence>

            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isRelaying ? "bg-nobody-mint animate-pulse" : "bg-gray-600"}`} />
                        <span className="text-white font-bold tracking-wider text-sm">RELAYER MODE</span>
                    </div>

                    {/* Toggle Switch */}
                    <button
                        onClick={() => onToggle(!isRelaying)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${isRelaying ? "bg-nobody-mint" : "bg-gray-700"}`}
                    >
                        <motion.div
                            layout
                            className="w-4 h-4 rounded-full bg-black shadow-md"
                            animate={{ x: isRelaying ? 24 : 0 }}
                        />
                    </button>
                </div>

                {isRelaying ? (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <div className="text-gray-500 text-xs font-mono mb-1">DATA PROCESSED</div>
                            <div className="text-nobody-mint font-mono font-bold">{traffic}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-mono mb-1">RELAY EARNINGS</div>
                            <div className="text-nobody-violet font-mono font-bold">{earnings}</div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-gray-500 text-xs font-mono mb-1">ACTIVE HOP CONNECTIONS</div>
                            <div className="flex gap-1 h-2">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-sm transition-colors duration-300 ${i < activeConnections ? "bg-nobody-mint/80" : "bg-gray-800"}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500 text-xs font-mono italic pt-2">
                        Enable Relayer Mode to earn incentives by forwarding mesh traffic.
                    </div>
                )}
            </div>
        </div>
    );
};
