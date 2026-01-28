import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { motion } from "framer-motion";
import "./styles.css";

interface MeshEvent {
    type: string;
    peer_id?: string;
    address?: string;
    intent?: any;
}

interface Peer {
    id: string;
    address: string;
    timestamp: number;
}

interface ThoughtLog {
    message: string;
    timestamp: number;
    type: "noir" | "arcium" | "silentswap" | "mesh";
}

function App() {
    const [intent, setIntent] = useState("");
    const [peers, setPeers] = useState<Peer[]>([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [logs, setLogs] = useState<ThoughtLog[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Listen for mesh events
        const unlisten = listen<MeshEvent>("mesh-event", (event) => {
            const meshEvent = event.payload;

            if (meshEvent.type === "PeerDiscovered") {
                setPeers((prev) => [
                    ...prev,
                    {
                        id: meshEvent.peer_id || "",
                        address: meshEvent.address || "",
                        timestamp: Date.now(),
                    },
                ]);

                addLog(`Peer discovered: ${meshEvent.peer_id}`, "mesh");
            } else if (meshEvent.type === "IntentReceived") {
                addLog("Received encrypted intent from mesh", "mesh");
            }
        });

        // Monitor internet connectivity
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            unlisten.then((fn) => fn());
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const addLog = (message: string, type: ThoughtLog["type"]) => {
        setLogs((prev) => [
            { message, timestamp: Date.now(), type },
            ...prev.slice(0, 9), // Keep last 10 logs
        ]);
    };

    const handleSubmitIntent = async () => {
        if (!intent.trim()) return;

        setIsProcessing(true);
        addLog("Encrypting intent...", "noir");

        try {
            // Step 1: Generate ZK proof
            const proof = await invoke("generate_zk_proof", {
                balance: 10000,
                bidAmount: 500,
                priceCeiling: 600,
            });

            addLog("[Noir] Proof Generated ✓", "noir");

            // Step 2: Negotiate with Shark Agent
            addLog("[Arcium] MPC Negotiation started", "arcium");

            const negotiation = await invoke("negotiate_with_shark", {
                intent: intent,
                priceCeiling: 100.0,
                marketPrice: 95.0,
            });

            addLog("[Arcium] Strategy optimized", "arcium");

            // Step 3: Broadcast to mesh
            addLog("Broadcasting to Mesh...", "mesh");

            await invoke("send_intent_to_mesh", {
                payload: JSON.stringify({ intent, proof, negotiation }),
            });

            addLog("Intent broadcasted to mesh", "mesh");
            addLog("[SilentSwap] Finalizing on Solana...", "silentswap");

            setIntent("");
        } catch (error) {
            addLog(`Error: ${error}`, "mesh");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-screen w-screen bg-nobody-dark overflow-hidden flex flex-col">
            {/* Status Bar */}
            <div className="absolute top-4 right-4 flex gap-4 z-10">
                <div className="flex items-center gap-2 bg-nobody-charcoal px-4 py-2 rounded-lg border border-gray-700">
                    <div
                        className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"
                            } animate-pulse`}
                    />
                    <span className="text-xs uppercase">
                        Internet: {isOnline ? "Connected" : "Disconnected"}
                    </span>
                </div>

                <div className="flex items-center gap-2 bg-nobody-charcoal px-4 py-2 rounded-lg border border-gray-700">
                    <div className="w-2 h-2 rounded-full bg-nobody-violet animate-pulse" />
                    <span className="text-xs uppercase">Mesh Nodes: {peers.length}</span>
                </div>

                <div className="flex items-center gap-2 bg-nobody-charcoal px-4 py-2 rounded-lg border border-gray-700">
                    <div className="w-2 h-2 rounded-full bg-nobody-mint animate-pulse" />
                    <span className="text-xs uppercase">Privacy: MAX</span>
                </div>
            </div>

            {/* Main Content - Radar */}
            <div className="flex-1 flex items-center justify-center relative">
                {/* Central Pulse */}
                <motion.div
                    className="absolute w-32 h-32 rounded-full bg-nobody-violet neon-glow"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 0.8, 0.6],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                <div className="absolute w-24 h-24 rounded-full bg-nobody-violet" />

                {/* Radar Grid */}
                <div className="absolute w-96 h-96 border border-nobody-violet/30 rounded-full" />
                <div className="absolute w-64 h-64 border border-nobody-violet/20 rounded-full" />
                <div className="absolute w-32 h-32 border border-nobody-violet/10 rounded-full" />

                {/* Peer Dots */}
                {peers.map((peer, index) => {
                    const angle = (index * 360) / Math.max(peers.length, 1);
                    const radius = 150;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;

                    return (
                        <motion.div
                            key={peer.id}
                            className="absolute w-3 h-3 rounded-full bg-nobody-violet"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                left: `calc(50% + ${x}px)`,
                                top: `calc(50% + ${y}px)`,
                                boxShadow: "0 0 10px rgba(139, 92, 246, 0.8)",
                            }}
                        />
                    );
                })}

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-nobody-mint text-lg font-bold uppercase tracking-wider">
                        Nobody
                    </p>
                </div>
            </div>

            {/* Thought Stream - Right Side */}
            <div className="absolute right-4 top-32 bottom-32 w-80 bg-nobody-charcoal/90 border border-gray-700 rounded-lg p-4 overflow-y-auto">
                <h3 className="text-sm uppercase font-bold mb-4 text-nobody-mint">
                    Thought Stream
                </h3>
                <div className="space-y-2">
                    {logs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xs font-mono"
                        >
                            <span className={`
                ${log.type === 'noir' ? 'text-purple-400' : ''}
                ${log.type === 'arcium' ? 'text-blue-400' : ''}
                ${log.type === 'silentswap' ? 'text-green-400' : ''}
                ${log.type === 'mesh' ? 'text-nobody-mint' : ''}
              `}>
                                {log.message}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Intent Composer - Bottom */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[600px]">
                <div className="bg-nobody-charcoal border-2 border-nobody-violet rounded-lg p-4">
                    <input
                        type="text"
                        value={intent}
                        onChange={(e) => setIntent(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSubmitIntent()}
                        placeholder="Buy 10 SOL under $95 using Shark Mode"
                        className="w-full bg-transparent text-nobody-mint border-none outline-none text-sm font-mono placeholder-gray-600"
                        disabled={isProcessing}
                    />

                    {isProcessing && (
                        <motion.div
                            className="mt-2 text-xs text-nobody-violet"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            Encrypting... Broadcasting to Mesh...
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
