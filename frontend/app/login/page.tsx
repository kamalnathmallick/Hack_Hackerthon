"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, User, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"TEAM_LEADER" | "TEAM_MEMBER" | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState<"TEAM_LEADER" | "TEAM_MEMBER" | "">("");
  const [regDomain, setRegDomain] = useState("");

  // Reset Password Form State
  const [resetEmail, setResetEmail] = useState("");
  const [resetCurrentPassword, setResetCurrentPassword] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg("");
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg("");
    setTimeout(() => setErrorMsg(""), 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setErrorMsg("");

    try {
      console.log("Sending login request");
      // Changed to use the base API_URL so just /auth/login
      const res = await apiRequest<{ token: string; user: any; role: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      }, false) as any;

      saveAuth(res.token, res.user);
      localStorage.setItem("token", res.token); // Explicitly required
      console.log("Login success");
      console.log("User role:", res.user.role);

      if (res.user.role === "TEAM_LEADER" || res.user.role === "leader") {
        router.push("/leader/dashboard");
      } else if (res.user.role === "TEAM_MEMBER" || res.user.role === "member") {
        router.push("/member/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      showError(err.message || "Invalid credentials");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (regPassword.length < 6) {
      showError("Password minimum 6 characters");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showError("Passwords do not match");
      return;
    }
    if (!regRole) {
      showError("Role required");
      return;
    }
    if (!regEmail || !regEmail.includes("@")) {
      showError("Invalid email");
      return;
    }

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          domain: regDomain
        })
      }, false);
      setIsRegisterModalOpen(false);
      showSuccess("Account created successfully");
    } catch (err: any) {
      showError(err.message || "User already exists");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!resetEmail) {
      showError("Invalid email");
      return;
    }
    if (!resetCurrentPassword) {
      showError("Current password is required");
      return;
    }
    if (resetNewPassword.length < 6) {
      showError("Password minimum 6 characters");
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      showError("Passwords do not match");
      return;
    }

    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email: resetEmail,
          currentPassword: resetCurrentPassword,
          newPassword: resetNewPassword
        })
      }, false);
      setIsResetModalOpen(false);
      setResetCurrentPassword("");
      setResetNewPassword("");
      setResetConfirmPassword("");
      showSuccess("Password updated successfully");
    } catch (err: any) {
      showError(err.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-[#f8fafc] selection:bg-indigo-500/30">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-300/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-300/30 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl glass rounded-[2.5rem] p-12 shadow-2xl border border-white/60 relative z-10"
      >
        {successMsg && (
          <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-xl text-center font-medium shadow-sm">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-xl text-center font-medium shadow-sm">
            {errorMsg}
          </div>
        )}

        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-xl shadow-indigo-500/30 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6">
            H
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            Choose your portal
          </h1>
          <p className="text-lg text-slate-500 max-w-lg mx-auto">
            Sign in to HackFlow AI to manage your automated workflows, team assignments, and AI-generated outputs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole("TEAM_LEADER")}
            className={`cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 relative overflow-hidden ${selectedRole === "TEAM_LEADER"
                ? "border-indigo-500 bg-white shadow-xl shadow-indigo-500/10"
                : "border-transparent bg-white/50 hover:bg-white/80 border-white"
              }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${selectedRole === "TEAM_LEADER" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
              }`}>
              <Shield size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Team Leader</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Create AI projects, orchestrate agent workflows, and manage team progress automatically.
            </p>
            {selectedRole === "TEAM_LEADER" && (
              <div className="absolute top-6 right-6 w-3 h-3 bg-indigo-500 rounded-full" />
            )}
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole("TEAM_MEMBER")}
            className={`cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 relative overflow-hidden ${selectedRole === "TEAM_MEMBER"
                ? "border-blue-500 bg-white shadow-xl shadow-blue-500/10"
                : "border-transparent bg-white/50 hover:bg-white/80 border-white"
              }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${selectedRole === "TEAM_MEMBER" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
              }`}>
              <User size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Team Member</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              View assigned tasks, update completion progress, and collaborate on project execution.
            </p>
            {selectedRole === "TEAM_MEMBER" && (
              <div className="absolute top-6 right-6 w-3 h-3 bg-blue-500 rounded-full" />
            )}
          </motion.div>
        </div>

        <motion.div
          initial={false}
          animate={{ height: selectedRole ? "auto" : 0, opacity: selectedRole ? 1 : 0 }}
          className="overflow-hidden"
        >
          <form onSubmit={handleLogin} className="max-w-md mx-auto space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`Enter your ${selectedRole === "TEAM_LEADER" ? "leader" : "member"} email`}
              className="w-full bg-white border border-slate-200 rounded-xl py-4 px-5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 font-medium"
              required
            />
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white border border-slate-200 rounded-xl py-4 px-5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 font-medium"
                required
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-shadow"
            >
              Sign In to Portal <ArrowRight size={20} />
            </button>

            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-center">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(true)}
                className="text-indigo-600 font-bold py-2 px-4 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                Create New Account
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800">Create New Account</h2>
                <button onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                      <select required value={regRole} onChange={e => setRegRole(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 focus:bg-white transition-colors">
                        <option value="">Select role</option>
                        <option value="TEAM_LEADER">Team Leader</option>
                        <option value="TEAM_MEMBER">Team Member</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
                      <input type="text" value={regDomain} onChange={e => setRegDomain(e.target.value)} placeholder="e.g. Management" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                    <PasswordStrengthMeter password={regPassword} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                    <input type="password" required value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                  </div>
                  <button type="submit" className="w-full mt-6 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors">
                    Sign Up
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800">Reset Password</h2>
                <button onClick={() => setIsResetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" required value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                    <input type="password" required value={resetCurrentPassword} onChange={e => setResetCurrentPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                    <input type="password" required value={resetNewPassword} onChange={e => setResetNewPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                    <PasswordStrengthMeter password={resetNewPassword} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                    <input type="password" required value={resetConfirmPassword} onChange={e => setResetConfirmPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                  </div>
                  <button type="submit" className="w-full mt-6 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors">
                    Update Password
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
