import React from "react";
import { motion } from "framer-motion";

interface DealNotificationProps {
    visible: boolean;
    onClose: () => void;
    onAccept?: () => void;
}

export const DealNotification: React.FC<DealNotificationProps> = ({ visible, onClose, onAccept }) => {
    if (!visible) return null;

    return (
        <motion.div
            className="absolute top-20 right-8 z-[70] w-[400px] shadow-[0_10px_50px_rgba(0,0,0,0.8)]"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
        >
            <div className="border border-l-4 border-l-nobody-mint border-y-gray-700 border-r-gray-700 bg-nobody-charcoal rounded-sm overflow-hidden font-mono">

                {/* Header */}
                <div className="bg-gray-900/90 p-3 border-b border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="animate-pulse text-lg">🔔</span>
                        <span className="text-white text-xs font-bold tracking-wider">NOTIFICATION</span>
                    </div>
                    <span className="text-[10px] text-gray-500">just now</span>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4 relative">
                    <div className="text-white text-sm font-bold border-l-2 border-gray-600 pl-3 py-1">
                        "Agent found a matching Buyer for 'Clueless Fox #04'"
                    </div>

                    <div className="bg-black/30 p-3 border border-gray-800 space-y-2 text-xs">
                        <div className="text-gray-500 font-bold mb-2 uppercase tracking-wide border-b border-gray-800 pb-1">
                            [ 📈 DEAL ANALYSIS ]
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Buyer</span>
                            <span className="text-white font-bold">Verified Nobody <span className="text-nobody-mint">(Rep: 99%)</span></span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Price</span>
                            <span className="text-white font-bold">13.5 SOL <span className="text-gray-600 font-normal">(Floor: 12.0)</span></span>
                        </div>
                        <div className="flex justify-between border-t border-gray-800 pt-2 mt-1">
                            <span className="text-gray-400">Net Profit</span>
                            <span className="text-green-500 font-bold">+1.5 SOL</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                        <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                            [ ACTION ]
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={onAccept}
                                className="bg-nobody-mint text-black font-bold py-2 text-[10px] uppercase hover:bg-white transition-colors flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(45,212,191,0.2)]"
                            >
                                <span>✔ ACCEPT & MINT</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="bg-gray-800 text-gray-400 font-bold py-2 text-[10px] uppercase hover:bg-red-900 hover:text-white transition-colors border border-gray-700 hover:border-red-500"
                            >
                                X REJECT
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};
