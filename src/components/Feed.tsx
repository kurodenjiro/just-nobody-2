import React, { useState } from "react";
import { motion } from "framer-motion";

export const Feed: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Mock Items based on V2 Spec
    const feedItems = [
        {
            id: 1, type: "user", user: "User_C", meta: "500m Away - Mesh Direct",
            content: "Looking to buy used ESP32 components",
            fee: "10 $NEAR",
            actions: ["[ Send Quote ]", "[ Direct Chat ]"]
        },
        {
            id: 2, type: "agent", user: "AI AGENT", meta: "Aggregated from Web",
            content: "Hot: NEAR Protocol just released Chain Abstraction updates...",
            actions: ["[ Read Summary ]", "[ Save Task ]"]
        },
        {
            id: 3, type: "nft", user: "BEYOND_US NFT", meta: "User_X - 2 Hops",
            content: "Just minted new collection on Cronos",
            sub: "[ Compressed Vector Image ]",
            actions: ["[ ❤️ 12 ]", "[ ⚡ Bid: 1.2 x402 ]"]
        }
    ];

    return (
        <motion.div
            className="absolute bottom-0 left-0 right-0 bg-nobody-charcoal border-t border-nobody-violet/30 transition-all duration-500 ease-in-out z-30 overflow-hidden flex flex-col font-mono"
            animate={{ height: isExpanded ? "60vh" : "6rem" }}
            initial={{ height: "6rem" }}
        >
            {/* Header: Search & Config */}
            <div
                className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-gray-800 bg-black/20 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex gap-4 text-xs text-gray-400">
                    <span className="hover:text-white transition-colors">[ 🔍 Search Intent... ]</span>
                </div>
                <div className={`text-gray-600 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▲</div>
            </div>

            {/* Notification / Alert Area */}
            <div className="bg-gray-900/80 px-4 py-2 border-b border-gray-800 text-xs">
                <span className="text-nobody-mint font-bold">[!] 3 NEW TASKS MATCHING PROFILE</span>
                <span className="ml-2 text-gray-500 italic"> {"<-- Priority Alert from Agent"}</span>
            </div>

            {/* List Content */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-black/40">
                {feedItems.map((item) => (
                    <div key={item.id} className="border border-gray-700 bg-nobody-charcoal rounded overflow-hidden relative">
                        {/* Header Line */}
                        <div className="bg-gray-800 px-3 py-1 flex justify-between items-center text-[10px] text-gray-400 border-b border-gray-700">
                            <span>
                                {item.type === 'user' && '👤'}
                                {item.type === 'agent' && '🤖'}
                                {item.type === 'nft' && '🖼️'}
                                <span className="ml-1 text-white font-bold">{item.user}</span> ({item.meta})
                            </span>
                        </div>

                        {/* Content */}
                        <div className="p-3 text-sm text-gray-300">
                            {item.sub && <div className="text-xs text-gray-500 mb-1">{item.sub}</div>}
                            <div className="mb-2 italic">"{item.content}"</div>
                            {item.fee && <div className="text-nobody-mint font-bold text-xs mb-2">💰 Proposal: {item.fee}</div>}

                            {/* Actions */}
                            <div className="flex gap-2 mt-2 pt-2 border-t border-gray-800 border-dashed">
                                {item.actions.map((action, i) => (
                                    <button key={i} className="text-[10px] uppercase text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-2 py-1 rounded transition-colors">
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
