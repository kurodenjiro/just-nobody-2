import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationToastProps {
    message: string | null;
    onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, onClose }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
                >
                    <div className="bg-nobody-charcoal border border-nobody-mint px-6 py-3 rounded-full shadow-[0_0_20px_rgba(110,231,183,0.2)] flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-nobody-mint animate-pulse" />
                        <span className="text-nobody-mint font-mono text-xs uppercase tracking-wider">
                            {message}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
