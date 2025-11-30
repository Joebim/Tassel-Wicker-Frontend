import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuCheck, LuX, LuTriangle, LuInfo, LuCircle } from "react-icons/lu";
import { useToastStore, type Toast } from "@/store/toastStore";

const ToastComponent: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    const getToastIcon = (type: Toast["type"]) => {
        switch (type) {
            case "success":
                return <LuCheck className="text-white" size={20} />;
            case "error":
                return <LuCircle className="text-white" size={20} />;
            case "warning":
                return <LuTriangle className="text-white" size={20} />;
            case "info":
                return <LuInfo className="text-white" size={20} />;
            default:
                return <LuInfo className="text-white" size={20} />;
        }
    };

    const getToastStyles = (type: Toast["type"]) => {
        // All toast states use the same transparent black with frosted blur styling
        return {
            bg: "bg-black/60",
            border: "border-white/20",
            text: "text-white",
        };
    };

    return (
        <div className="fixed top-4 right-4 z-[10000] space-y-2">
            <AnimatePresence>
                {toasts.map((toast: Toast) => {
                    const styles = getToastStyles(toast.type);
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 300, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 300, scale: 0.8 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            className={`
                ${styles.bg} ${styles.border} ${styles.text}
                border rounded-lg shadow-lg backdrop-blur-md
                min-w-[320px] max-w-[400px] p-4
                flex items-start gap-3
              `}
                        >
                            {/* Icon */}
                            <div className="shrink-0 mt-0.5">
                                {getToastIcon(toast.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-extralight text-sm uppercase tracking-wide mb-1">
                                    {toast.title}
                                </h4>
                                {toast.message && (
                                    <p className="text-xs font-extralight opacity-90 leading-relaxed">
                                        {toast.message}
                                    </p>
                                )}
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="shrink-0 p-1 hover:bg-white/10 rounded transition-colors duration-200 cursor-pointer"
                            >
                                <LuX size={16} className="text-white opacity-60 hover:opacity-100" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default ToastComponent;
