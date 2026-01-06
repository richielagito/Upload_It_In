"use client";
import React, { useState } from 'react';
import { createClient } from "@/lib/supabase";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Briefcase, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Student');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Sync session with Flask
      const accessToken = data.session.access_token;
      const res = await fetch('/set_session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken }),
      });
      
      if (res.ok) {
          router.push('/dashboard');
      } else {
          throw new Error("Failed to sync session with backend");
      }

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login-register`,
          data: {
            username,
            role,
          },
        },
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Registration successful! Please check your email to verify your account.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 md:p-4">
      <div className="max-w-4xl w-full bg-white md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-[600px]">
        
        {/* Left Side - Visual */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
           
           <div className="relative z-10">
             <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8">
                <ArrowLeft size={20} /> Back to Home
             </Link>
             <h2 className="text-4xl font-bold mb-4">
                {isLogin ? "Welcome Back!" : "Join Us Today"}
             </h2>
             <p className="text-blue-100 text-lg leading-relaxed">
                {isLogin 
                    ? "Log in to access your dashboard, analyze essays, and track your progress." 
                    : "Create an account to start grading essays with the power of AI."}
             </p>
           </div>
            
           <div className="relative z-10 mt-12 hidden md:block">
             <div className="p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
                <div className="flex gap-4 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="space-y-3">
                    <div className="h-2 bg-white/20 rounded w-3/4" />
                    <div className="h-2 bg-white/20 rounded w-1/2" />
                </div>
             </div>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800">{isLogin ? "Sign In" : "Sign Up"}</h3>
                <p className="text-slate-500 mt-2">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setMessage(null); }}
                        className="text-blue-600 font-bold ml-1 cursor-pointer hover:underline outline-none"
                    >
                        {isLogin ? "Register" : "Login"}
                    </button>
                </p>
            </div>

            {message && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
                >
                    {message.text}
                </motion.div>
            )}

            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-5">
                {!isLogin && (
                    <div className="relative">
                        <User className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Full Name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full text-slate-800 pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            required
                        />
                    </div>
                )}

                <div className="relative">
                    <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="email" 
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-slate-800 pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        required
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="password" 
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-slate-800 pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        required
                    />
                </div>

                {!isLogin && (
                    <div className="relative">
                        <Briefcase className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={20} />
                        <select 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full text-slate-800 pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none bg-white"
                        >
                            <option value="Student">Student</option>
                            <option value="Teacher">Teacher</option>
                        </select>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        isLogin ? "Login Now" : "Create Account"
                    )}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
