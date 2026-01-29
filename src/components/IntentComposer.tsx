import React from "react";
import { motion } from "framer-motion";

interface IntentComposerProps {
    intent: string;
    setIntent: (val: string) => void;
    onSubmit: () => void;
    isProcessing: boolean;
}

export const IntentComposer: React.FC<IntentComposerProps> = ({ intent, setIntent, onSubmit, isProcessing }) => {
    return (
        <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] z-20 flex flex-col items-center gap-6">
            <div className={`w-full relative bg-nobody-charcoal border transition-all duration-300 ${isProcessing ? 'border-nobody-mint shadow-[0_0_15px_rgba(110,231,183,0.3)]' : 'border-nobody-violet'} rounded-lg p-1`}>

                {/* Noir Icon Spinner */}
                {isProcessing && (
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-black border border-nobody-mint rounded-full flex items-center justify-center z-10 animate-spin">
                        <div className="w-2 h-2 bg-nobody-mint rounded-sm" />
                    </div>
                )}

                <input
                    type="text"
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            console.log("Enter Key Pressed");
                            onSubmit();
                        }
                    }}
                    placeholder="Describe your intent..."
                    className="w-full bg-black/50 text-white p-4 outline-none font-mono text-sm rounded placeholder-gray-600 focus:bg-black/80 transition-colors pr-24"
                    disabled={isProcessing}
                />

                {/* Enter Badge / Submit Button */}
                <button
                    onClick={() => {
                        console.log("Submit Button Clicked");
                        onSubmit();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-gray-500 hover:text-white border border-gray-700 hover:border-gray-500 px-2 py-1 rounded transition-all"
                >
                    [ ENTER ]
                </button>

                {/* Highlight effect for 'Shark Mode' */}
                {intent.toLowerCase().includes("shark mode") && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute right-28 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-nobody-mint font-bold bg-nobody-mint/10 px-2 py-1 rounded border border-nobody-mint/20"
                    >
                        Shark Mode
                    </motion.div>
                )}
            </div>

            {/* Instruction / Help Text */}
            <div className="mt-2 text-center text-gray-500 text-[10px] uppercase tracking-widest">
                Protected by Just Nobody Protocol v1.0
            </div>
        </div>
    );
};
