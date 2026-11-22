"use client";

import { motion } from "framer-motion";
import { Search, Bell, User, LogOut } from "lucide-react";
import { clearAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-24 fixed top-0 right-0 left-64 p-6 z-40 pointer-events-none"
    >
      <div className="w-full h-full glass rounded-2xl px-6 flex items-center justify-between shadow-xl border border-white/40 pointer-events-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4 flex-1">
          <div className="relative w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search projects, tasks, or members..." 
              className="w-full bg-white/50 border border-white/60 rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all shadow-sm placeholder:text-slate-400 text-slate-700 text-sm font-medium"
            />
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-white/60 border border-white shadow-sm flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors relative"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-white shadow-md flex items-center justify-center text-white relative overflow-hidden"
          >
            <User size={18} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 shadow-sm flex items-center justify-center text-rose-500 hover:text-rose-600 transition-colors ml-2"
            title="Logout"
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
