import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AgentLogProps {
    visible: boolean;
    logs: string[];
}

export const AgentLog: React.FC<AgentLogProps> = ({ visible, logs }) => {
    if (!visible) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="absolute inset-x-4 top-[15%] mx-auto w-[700px] z-50 font-mono text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            >
                <div className="bg-nobody-dark border border-gray-600 shadow-2xl overflow-hidden rounded">
                    {/* Header */}
                    <div className="bg-gray-800 border-b border-gray-600 p-3 text-center">
                        <span className="text-white font-bold tracking-widest">[ LOCAL AGENT PROCESSING ]</span>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Processing Steps */}
                        {logs.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-1"
                            >
                                <div className="text-green-400 text-xs">
                                    {log}
                                </div>
                                {i === logs.length - 1 && (
                                    <div className="mt-2 bg-gray-800 rounded h-2 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-green-500"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 1.5 }}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
