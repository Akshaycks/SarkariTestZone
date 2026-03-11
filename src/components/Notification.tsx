import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '../utils';

interface NotificationProps {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Notification({ show, message, type, onClose }: NotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className={cn(
            "fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl z-[1000] flex items-center gap-3 min-w-[320px] border",
            type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : 
            type === 'error' ? "bg-red-50 border-red-100 text-red-800" : 
            "bg-blue-50 border-blue-100 text-blue-800"
          )}
        >
          {type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
           type === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" /> : 
           <CheckCircle2 className="w-5 h-5 text-blue-500" />}
          
          <p className="flex-1 font-bold text-sm">{message}</p>
          
          <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-4 h-4 opacity-50" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
