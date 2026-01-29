import React, { useState } from "react";
import { motion } from "framer-motion";

interface ServiceCreatorProps {
    onClose: () => void;
    onDeploy: (service: any) => void;
}

export const ServiceCreator: React.FC<ServiceCreatorProps> = ({ onClose, onDeploy }) => {
    const [prompt, setPrompt] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [config, setConfig] = useState<any>(null);

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        // Simulate AI Agent Configuration
        setTimeout(() => {
            setConfig({
                logic: "AI Generative Service (Local Stable Diffusion)",
                price: "0.1 SOL (Fixed)",
                privacy: "Noir ZK-Proof Payment Verification [ ENABLED ]",
                delivery: "Encrypted Mesh Relay [ ENABLED ]",
                preview: "Anonymous AI Pixel Artist - 0.1 SOL"
            });
            setIsAnalyzing(false);
        }, 2000);
    };

    return (
        <motion.div
            className="absolute inset-0 bg-nobody-dark z-50 flex items-center justify-center p-8 font-mono"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
        >
            <div className="w-full max-w-2xl border border-nobody-violet bg-black/90 shadow-[0_0_30px_rgba(139,92,246,0.2)] rounded-sm overflow-hidden flex flex-col">

                {/* Header */}
                <div className="bg-gray-900 p-3 border-b border-gray-700 flex justify-between items-center">
                    <span className="text-nobody-violet font-bold tracking-wider">[ ✨ CREATE NEW SERVICE ]</span>
                    <div className="flex gap-4 text-xs">
                        <span className="text-white">[ 👤 MODE: PROVIDER ]</span>
                        <span className="text-nobody-mint">[ 🛡️ PRIVACY: SHIELDED ]</span>
                    </div>
                </div>

                <div className="p-6 space-y-6">

                    {/* Prompt Input */}
                    <div className="space-y-2">
                        <label className="text-gray-400 text-xs uppercase tracking-widest">[ ⌨️ SERVICE PROMPT ]</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onBlur={() => !config && prompt && handleAnalyze()}
                            placeholder='>_ Example: "I want to sell an AI Pixel Art service for 0.1 SOL per image..."'
                            className="w-full h-24 bg-gray-900/50 border border-gray-700 p-3 text-sm text-white focus:border-nobody-mint outline-none resize-none font-mono"
                        />
                    </div>

                    {/* Agent Config Output */}
                    {(isAnalyzing || config) && (
                        <div className="border-l-2 border-nobody-mint pl-4 space-y-2 transition-all">
                            <div className="text-nobody-mint font-bold text-xs animate-pulse">
                                [ 🤖 AGENT CONFIGURING... ]
                            </div>

                            {config ? (
                                <div className="text-sm space-y-1 text-gray-300">
                                    <div>- Logic: <span className="text-white">{config.logic}</span></div>
                                    <div>- Price: <span className="text-white">{config.price}</span></div>
                                    <div>- Privacy: <span className="text-nobody-mint">{config.privacy}</span></div>
                                    <div>- Delivery: <span className="text-nobody-mint">{config.delivery}</span></div>
                                </div>
                            ) : (
                                <div className="text-gray-500 text-sm">Analyzing intent semantics...</div>
                            )}
                        </div>
                    )}

                    {/* Traits */}
                    {config && (
                        <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4 text-xs">
                            <div className="text-gray-400">[🎨] Type: <span className="text-white">Digital Art</span></div>
                            <div className="text-gray-400">[🔒] Access: <span className="text-white">Private (ZK-Gated)</span></div>
                            <div className="text-gray-400">[⚡] Speed: <span className="text-white">Ultra (M4 Max)</span></div>
                            <div className="text-gray-400">[💰] Payout: <span className="text-white">Instant</span></div>
                        </div>
                    )}

                    {/* Preview */}
                    {config && (
                        <div className="bg-nobody-violet/10 border border-nobody-violet/30 p-3 text-center text-sm text-nobody-violet font-bold">
                            {">>"} PREVIEW LISTING: "{config.preview}"
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="border-t border-gray-700 p-4 flex justify-between bg-gray-900/50">
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xs font-bold">[ 🗑️ DISCARD ]</button>
                    <div className="flex gap-3">
                        <button className="text-gray-400 hover:text-white transition-colors text-xs font-bold border border-gray-700 px-3 py-2">[ ⚙️ ADVANCED SETUP ]</button>
                        <button
                            onClick={() => onDeploy(config)}
                            disabled={!config}
                            className={`text-black text-xs font-bold px-4 py-2 border transition-colors ${config ? 'bg-nobody-mint border-nobody-mint hover:bg-white' : 'bg-gray-700 border-gray-700 text-gray-500 cursor-not-allowed'}`}
                        >
                            [ 🚀 DEPLOY TO MESH ]
                        </button>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
