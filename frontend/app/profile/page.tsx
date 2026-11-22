"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/ui/Topbar";
import { Sidebar } from "@/components/ui/Sidebar";
import { apiRequest } from "@/lib/api";
import { getUser, getToken, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const token = getToken();
    const currentUser = getUser();
    if (!token || !currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    setName(currentUser.name || "");
    setDomain(currentUser.domain || "");
  }, [router]);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ user: any }>("/users/profile", {
        method: "PUT",
        body: JSON.stringify({ name, domain, email: user.email })
      });
      // Update local storage user
      const updatedUser = res.user;
      const authData = localStorage.getItem("auth");
      if (authData) {
        const parsed = JSON.parse(authData);
        parsed.user = updatedUser;
        localStorage.setItem("auth", JSON.stringify(parsed));
      }
      setUser(updatedUser);
      showMessage("Profile updated successfully", "success");
    } catch (error: any) {
      showMessage(error.message || "Failed to update profile", "error");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showMessage("New password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match", "error");
      return;
    }

    try {
      await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword
        })
      });
      showMessage("Password changed successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      showMessage(error.message || "Failed to change password", "error");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">Loading...</div>;

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-indigo-500/30">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px] pointer-events-none" />
      
      <Sidebar role={user.role} />
      <Topbar />
      
      <main className="ml-64 pt-24 p-6 min-h-screen">
        <div className="max-w-4xl mx-auto w-full space-y-8">
          
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-800">Profile Settings</h1>
            <button 
              onClick={handleLogout}
              className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition"
            >
              Logout
            </button>
          </div>

          {message.text && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl font-medium shadow-sm ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Info Form */}
            <div className="glass rounded-[2rem] p-8 shadow-xl border border-white/60">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Personal Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email (Read Only)</label>
                  <input type="email" value={user.email} disabled className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
                  <input type="text" value={domain} onChange={e => setDomain(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <button type="submit" className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
                  Update Profile
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="glass rounded-[2rem] p-8 shadow-xl border border-white/60">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-colors" />
                  <PasswordStrengthMeter password={newPassword} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <button type="submit" className="w-full mt-4 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-colors">
                  Change Password
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
