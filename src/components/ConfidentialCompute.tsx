import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ConfidentialComputeProps {
    visible: boolean;
    onClose: () => void;
}

export const ConfidentialCompute: React.FC<ConfidentialComputeProps> = ({ visible, onClose }) => {
    const [lines, setLines] = useState<any[]>([]);

    useEffect(() => {
        if (visible) {
            setLines([]);
            const sequence = [
                { side: 'A', text: "I have a ZK-Proof of funds.", delay: 500 },
                { side: 'B', text: "I have the 'Clueless Fox' NFT.", delay: 1500 },
                { side: 'A', text: "My bid is 10 SOL.", delay: 2500 },
                { side: 'B', text: "Market price is 16 SOL.", delay: 3500 },
                { side: 'A', text: "Analyzing scarcity... Counter: 12.", delay: 4500 },
                { side: 'B', text: "Calculating ROI... Counter: 14.", delay: 5500 },
                { side: 'CENTER', text: ">>> FINAL MATCH FOUND: 13.5 SOL <<<", delay: 7000 }
            ];

            sequence.forEach(({ side, text, delay }) => {
                setTimeout(() => {
                    setLines(prev => [...prev, { side, text }]);
                }, delay);
            });
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <motion.div
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/95 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="w-[800px] border border-gray-700 bg-nobody-charcoal shadow-[0_0_80px_rgba(139,92,246,0.15)] rounded-lg overflow-hidden flex flex-col relative h-[500px]">

                {/* Header */}
                <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-center text-xs font-bold tracking-[0.2em] relative">
                    <span className="text-white">CONFIDENTIAL COMPUTE (MPC/FHE)</span>
                    <button onClick={onClose} className="absolute right-4 text-gray-600 hover:text-white top-4">X</button>
                </div>

                {/* Main Arena */}
                <div className="flex-1 flex relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90">

                    {/* Agent A Zone */}
                    <div className="w-1/2 p-6 border-r border-gray-800/50 flex flex-col items-start bg-nobody-mint/5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-black border border-nobody-mint flex items-center justify-center text-xl">🤖</div>
                            <div>
                                <div className="text-nobody-mint font-bold text-sm">AGENT A (Shark)</div>
                                <div className="text-[10px] text-gray-500">Local Brain</div>
                            </div>
                        </div>
                        <div className="space-y-4 w-full">
                            {lines.filter(l => l.side === 'A').map((l, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                    <div className="bg-black/60 border border-nobody-mint/30 p-3 rounded-tr-xl rounded-bl-xl text-xs text-gray-300">
                                        "{l.text}"
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Agent B Zone */}
                    <div className="w-1/2 p-6 flex flex-col items-end bg-nobody-violet/5">
                        <div className="flex items-center gap-3 mb-8 flex-row-reverse text-right">
                            <div className="w-10 h-10 rounded-full bg-black border border-nobody-violet flex items-center justify-center text-xl">🤖</div>
                            <div>
                                <div className="text-nobody-violet font-bold text-sm">AGENT B (Seller)</div>
                                <div className="text-[10px] text-gray-500">Mesh Node (Alpha-7)</div>
                            </div>
                        </div>
                        <div className="space-y-4 w-full flex flex-col items-end">
                            {lines.filter(l => l.side === 'B').map((l, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <div className="bg-black/60 border border-nobody-violet/30 p-3 rounded-tl-xl rounded-br-xl text-xs text-gray-300 text-right">
                                        "{l.text}"
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* VS Badge */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-gray-700 rounded-full w-12 h-12 flex items-center justify-center font-bold text-gray-500 text-xs z-10 shadow-xl">
                        VS
                    </div>

                    {/* Match Result Overlay */}
                    {lines.some(l => l.side === 'CENTER') && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 text-black px-6 py-3 font-bold text-sm rounded shadow-[0_0_30px_rgba(255,255,255,0.4)] border border-gray-300 w-max"
                        >
                            {lines.find(l => l.side === 'CENTER').text}
                        </motion.div>
                    )}

                </div>
            </div>
        </motion.div>
    );
};
