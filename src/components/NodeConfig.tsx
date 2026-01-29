import React from "react";
import { motion } from "framer-motion";

interface NodeConfigProps {
    visible: boolean;
    onClose: () => void;
}

export const NodeConfig: React.FC<NodeConfigProps> = ({ visible, onClose }) => {
    const [tab, setTab] = React.useState<"node" | "agent">("node");

    if (!visible) return null;

    return (
        <motion.div
            className="absolute top-16 right-4 z-40 bg-nobody-dark"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="w-80 bg-nobody-charcoal border border-gray-700 rounded shadow-2xl font-mono text-xs overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    <Tab label="Node Ops" active={tab === "node"} onClick={() => setTab("node")} />
                    <Tab label="Strategy" active={tab === "agent"} onClick={() => setTab("agent")} />
                    <button onClick={onClose} className="px-4 text-gray-500 hover:text-white border-l border-gray-700">x</button>
                </div>

                <div className="p-4">
                    {tab === "node" ? (
                        <>
                            <div className="flex justify-between mb-4">
                                <span className="text-white font-bold">STATUS: ACTIVE ●</span>
                                <span className="text-gray-500">Node: Alpha-7</span>
                            </div>
                            <div className="space-y-3 mb-6">
                                <Toggle label="Share Bandwidth (5 MB/s)" defaultChecked />
                                <Toggle label="Share Compute (Llama-3)" defaultChecked />
                                <Toggle label="Auto-Verify Transactions" defaultChecked />
                            </div>
                            <div className="bg-black/50 p-3 border border-gray-800 text-center">
                                <div className="text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Projected Rewards</div>
                                <div className="text-xl text-nobody-mint font-bold">0.0042 NEAR/kb</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-4 bg-nobody-violet/10 p-2 border border-nobody-violet/30 rounded text-center">
                                <span className="text-nobody-violet font-bold">MODE: AGGRESSIVE</span>
                            </div>
                            <div className="space-y-4 text-gray-400">
                                <div className="flex justify-between">
                                    <span>Goal:</span>
                                    <span className="text-white">Profit Max</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Security:</span>
                                    <span className="text-white">2FA via x402</span>
                                </div>
                                <div className="text-[10px] bg-yellow-900/20 text-yellow-500 p-2 border border-yellow-900/50 rounded">
                                    [!] Note: This mode may cause you to miss time-sensitive tasks.
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center text-[10px] uppercase">
                                    <span>Flexible</span>
                                    <div className="h-1 flex-1 mx-2 bg-gray-700 rounded-full relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
                                    </div>
                                    <span>Aggressive</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-3 border-t border-gray-700 bg-black/20 text-center">
                    <button className="text-white hover:text-nobody-mint transition-colors uppercase tracking-widest text-[10px]">
                        [ {tab === "node" ? "Update Configuration" : "Save Personality"} ]
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const Toggle = ({ label, defaultChecked }: { label: string, defaultChecked?: boolean }) => (
    <div className="flex justify-between items-center">
        <span className="text-gray-400">{label}</span>
        <input type="checkbox" defaultChecked={defaultChecked} className="accent-nobody-violet" />
    </div>
);

const Tab = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-3 text-center transition-colors uppercase tracking-wider font-bold ${active ? 'bg-nobody-charcoal text-white' : 'bg-black/30 text-gray-600 hover:text-gray-400'}`}
    >
        {label}
    </button>
);
