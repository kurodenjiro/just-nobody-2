import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntegrityShieldProps {
    visible: boolean;
    onComplete: () => void;
}

export const IntegrityShield: React.FC<IntegrityShieldProps> = ({ visible, onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);
    const steps = [
        "Payload Signature (ShadowWire standard)",
        "ZK-Proof Validity (Noir verified)",
        "Content Hash Consistency",
        "Reputation Consensus (3/5 Peers)"
    ];

    useEffect(() => {
        if (visible) {
            setProgress(0);
            setStep(0);
            const interval = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        clearInterval(interval);
                        setTimeout(onComplete, 1500); // Wait a bit before completing
                        return 100;
                    }
                    return p + 2;
                });
            }, 30);

            // Simulate step completion
            const stepInterval = setInterval(() => {
                setStep(s => (s < 4 ? s + 1 : s));
            }, 800);

            return () => {
                clearInterval(interval);
                clearInterval(stepInterval);
            }
        }
    }, [visible, onComplete]);

    if (!visible) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="w-[600px] bg-nobody-charcoal border border-gray-700 shadow-[0_0_40px_rgba(45,212,191,0.1)] rounded-sm overflow-hidden p-6 relative">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-2">
                        <div className="flex gap-4">
                            <span className="text-nobody-mint font-bold">[ 🔒 INTEGRITY SHIELD ]</span>
                            <span className="text-gray-400 text-xs">[ 👤 SENDER: Nobody_42a8 ]</span>
                        </div>
                        <span className="text-xs text-yellow-500 animate-pulse font-bold uppercase">[ ⚡ STATUS: VERIFYING ]</span>
                    </div>

                    {/* Visual Flow Animation */}
                    <div className="flex justify-between items-center mb-8 px-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <div className="border border-gray-600 p-2 rounded">MESH PACKET</div>
                        <div className="text-nobody-mint animate-pulse">{">>>>> [ DECRYPTING ] >>>>>"}</div>
                        <div className="border border-nobody-mint text-nobody-mint p-2 rounded shadow-[0_0_10px_rgba(45,212,191,0.2)]">NOIR ZK-PROOF</div>
                        <div className="text-nobody-mint animate-pulse">{">>>>> [ CHECKING ] >>>>>"}</div>
                        <div className="border border-gray-600 p-2 rounded">LOCAL BRAIN</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-800 w-full mb-6 overflow-hidden">
                        <motion.div
                            className="h-full bg-nobody-mint shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Checklist */}
                    <div className="space-y-3 mb-6">
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest border-b border-gray-800 pb-1 mb-2">
                            [ CHECKLIST ]
                        </div>
                        {steps.map((label, i) => (
                            <motion.div
                                key={i}
                                className="flex justify-between items-center text-sm"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: step >= i ? 1 : 0.3, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400">{i + 1}.</span>
                                    <span className={`${step > i ? "text-white" : "text-gray-500"}`}>{label}</span>
                                </div>
                                <div>
                                    {step > i && <span className="text-nobody-mint font-bold text-xs">[ ✅ ]</span>}
                                    {step === i && <span className="text-yellow-500 font-bold text-xs animate-pulse">[ ⏳ ]</span>}
                                    {step < i && <span className="text-gray-700 font-bold text-xs">[ ... ]</span>}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Security Log */}
                    <div className="bg-black/50 border border-gray-800 p-3 text-xs space-y-1 font-mono text-gray-400 h-24 overflow-y-auto">
                        <div className="text-gray-500 font-bold mb-1 border-b border-gray-800 pb-1">[ 🦈 SECURITY AGENT LOG ]</div>
                        {step >= 1 && <div className="text-gray-300">- "Detecting 2 relay hops. All headers stripped successfully."</div>}
                        {step >= 2 && <div className="text-gray-300">- "Verifying ZK-Proof... Mathematical integrity confirmed."</div>}
                        {step >= 3 && <div className="text-red-400">- "Warning: Node_7b tried to append metadata. Blocked & Discarded."</div>}
                    </div>

                    {/* Footer Actions (Static for visual) */}
                    <div className="mt-4 flex gap-2">
                        <button className="flex-1 bg-gray-800 text-gray-500 border border-gray-700 py-2 text-[10px] font-bold uppercase cursor-not-allowed">
                            [ UNLOCK & EXECUTE ]
                        </button>
                    </div>

                    {progress >= 100 && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm z-20"
                        >
                            <div className="text-nobody-mint text-xl font-bold tracking-widest border-2 border-nobody-mint p-4 shadow-[0_0_30px_rgba(45,212,191,0.3)] bg-black">
                                [ DATA IS PURE & UNTOUCHED ]
                            </div>
                        </motion.div>
                    )}

                </div>
            </motion.div>
        </AnimatePresence>
    );
};
