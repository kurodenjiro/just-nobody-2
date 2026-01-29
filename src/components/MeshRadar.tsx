import React from "react";
import { motion } from "framer-motion";
import { Peer } from "../types";

interface MeshRadarProps {
    peers: Peer[];
}

export const MeshRadar: React.FC<MeshRadarProps> = ({ peers }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            {/* 3D Perspective Plane */}
            <div className="relative w-[800px] h-[800px] flex items-center justify-center" style={{ transform: "perspective(1000px) rotateX(20deg)" }}>

                {/* Central Pulse */}
                <motion.div
                    className="absolute w-32 h-32 rounded-full bg-nobody-violet/20 blur-xl"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="absolute w-4 h-4 rounded-full bg-nobody-violet shadow-[0_0_20px_rgba(139,92,246,0.8)]" />

                {/* Concentric Radar Rings */}
                {[1, 2, 3, 4].map((ring) => (
                    <motion.div
                        key={ring}
                        className="absolute rounded-full border border-nobody-violet/10"
                        style={{ width: `${ring * 200}px`, height: `${ring * 200}px` }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60 + ring * 10, repeat: Infinity, ease: "linear" }}
                    >
                        {/* Radar Sweep Effect */}
                        <div className="w-full h-full rounded-full border-t border-nobody-violet/30 opacity-50" />
                    </motion.div>
                ))}

                {/* Peers / Shadow Nodes */}
                {peers.map((peer, index) => {
                    // Randomize position slightly for "data hopping" effect within a ring
                    const seed = peer.id.charCodeAt(0) % 360;
                    const angle = (index * (360 / Math.max(peers.length, 1))) + seed;
                    const radius = 250 + (index % 2) * 100; // Distribute across rings
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;

                    return (
                        <motion.div
                            key={peer.id}
                            className="absolute"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                x: x,
                                y: y
                            }}
                            transition={{ type: "spring", stiffness: 100 }}
                        >
                            {/* Peer Dot */}
                            <div className="w-3 h-3 rounded-full bg-nobody-violet shadow-[0_0_15px_rgba(139,92,246,0.6)]" />

                            {/* Data Packet Hopping Animation */}
                            <motion.div
                                className="absolute top-0 left-0 w-3 h-3 rounded-full bg-nobody-mint"
                                animate={{
                                    x: [0, -x], // Hop to center
                                    y: [0, -y],
                                    opacity: [0, 1, 0],
                                    scale: [0.5, 1, 0.5]
                                }}
                                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                            />

                            {/* Metadata Stripped Label */}
                            <motion.div
                                className="absolute top-4 left-4 whitespace-nowrap"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 + 1 }}
                            >
                                <span className="text-[10px] font-mono text-nobody-mint/70 bg-black/50 px-1 rounded">
                                    [ IP: STRIPPED ]
                                </span>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
