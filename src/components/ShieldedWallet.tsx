import React, { useState } from "react";
import { motion } from "framer-motion";

interface ShieldedWalletProps {
    visible: boolean;
    onClose: () => void;
}

export const ShieldedWallet: React.FC<ShieldedWalletProps> = ({ visible, onClose }) => {
    const [revealBalance, setRevealBalance] = useState(false);

    // Mock Data
    const balance = "142.5 SOL";
    const pendingIntents = [
        { id: "#042b", amount: "9.1 SOL", reason: "Reserved for ESP32 Trade" },
        { id: "#042c", amount: "1.2 SOL", reason: "Reserved for Mesh Gas" },
    ];

    if (!visible) return null;

    return (
        <motion.div
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="w-[650px] border border-gray-700 bg-nobody-charcoal shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden flex flex-col">

                {/* Header */}
                <div className="bg-gray-900 p-3 border-b border-gray-700 flex justify-between items-center text-xs font-bold tracking-wider">
                    <div className="flex gap-4 text-nobody-mint">
                        <span>[ 💰 SHIELDED WALLET ]</span>
                        <span className="text-white">[ 🔒 ZK-COMPRESSION: ON ]</span>
                    </div>
                    <span className="text-nobody-violet animate-pulse">[ ⚡ MESH READY ]</span>
                </div>

                {/* Main Content */}
                <div className="p-6 space-y-6">

                    {/* Balance Section */}
                    <div className="border border-gray-600 bg-black/40 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm uppercase">Available Balance:</span>
                            <div
                                className="cursor-pointer"
                                onMouseEnter={() => setRevealBalance(true)}
                                onMouseLeave={() => setRevealBalance(false)}
                            >
                                {revealBalance ? (
                                    <span className="text-nobody-mint font-bold text-xl tracking-widest drop-shadow-[0_0_5px_rgba(45,212,191,0.8)]">
                                        {balance}
                                    </span>
                                ) : (
                                    <span className="text-gray-600 font-bold text-xl tracking-widest animate-pulse">
                                        [ ████████ ]
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-500 italic flex items-center gap-2">
                            (Hover to reveal)
                            <span className="text-green-500">STATUS: All funds are ZK-Proven & Snapshot updated (2h ago)</span>
                        </div>
                    </div>

                    {/* Proof Generator */}
                    <div className="space-y-2">
                        <div className="text-gray-400 text-xs font-bold uppercase border-b border-gray-800 pb-1 w-max">
                            [ 🛡️ PROOF GENERATOR ]
                        </div>
                        <ul className="text-xs space-y-1 pl-2 text-gray-300">
                            <li>- Valid for Mesh Trades: <span className="text-nobody-mint font-bold">YES</span></li>
                            <li>- Last Integrity Check: <span className="text-nobody-mint font-bold">[ PASS ✅ ]</span></li>
                        </ul>
                    </div>

                    {/* Pending Intents */}
                    <div className="space-y-2">
                        <div className="text-gray-400 text-xs font-bold uppercase border-b border-gray-800 pb-1 w-max">
                            [ PENDING INTENTS (Locked Funds) ]
                        </div>
                        <ul className="text-xs space-y-2 pl-2 text-gray-400">
                            {pendingIntents.map((intent) => (
                                <li key={intent.id} className="flex justify-between border-b border-gray-800/50 pb-1 last:border-0">
                                    <span>- Intent <span className="text-white">{intent.id}</span>: {intent.amount}</span>
                                    <span className="text-gray-600 italic">({intent.reason})</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-900 border-t border-gray-700 p-4 flex justify-between items-center text-xs">
                    <div className="flex gap-3">
                        <button className="bg-gray-800 hover:bg-white hover:text-black text-white px-3 py-2 border border-gray-600 transition-colors font-bold">
                            [ UPDATE SNAPSHOT ]
                        </button>
                        <button className="bg-nobody-mint/10 hover:bg-nobody-mint hover:text-black text-nobody-mint px-3 py-2 border border-nobody-mint/40 transition-colors font-bold">
                            [ ADD FUNDS ]
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 transition-colors font-bold flex items-center gap-1"
                    >
                        [ 🗑️ SHRED PROOFS ]
                    </button>
                </div>

            </div>
        </motion.div>
    );
};
