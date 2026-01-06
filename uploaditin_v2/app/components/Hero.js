"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                            Revolutionize the Way You <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Grade Essays</span>
                        </motion.h1>

                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                            Analyze. Grade. Improve — in seconds. UploadItIn transforms how you evaluate essays — making the process faster, smarter, and more reliable than ever.
                        </motion.p>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-wrap justify-center lg:justify-start gap-4">
                            <Link href="/login-register" className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2">
                                Start Now <ArrowRight size={20} />
                            </Link>
                            <Link href="#how-it-works" className="px-8 py-4 rounded-full bg-white text-slate-700 font-bold text-lg border border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2">
                                <Play size={20} className="fill-current" /> How It Works
                            </Link>
                        </motion.div>

                        {/* Stats */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto lg:mx-0">
                            <div className="p-4 rounded-2xl bg-white/60 backdrop-blur border border-white shadow-sm">
                                <div className="text-2xl font-bold text-slate-900">1000+</div>
                                <div className="text-sm text-slate-500">Essays Graded</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/60 backdrop-blur border border-white shadow-sm">
                                <div className="text-2xl font-bold text-slate-900">500+</div>
                                <div className="text-sm text-slate-500">Active Users</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/60 backdrop-blur border border-white shadow-sm">
                                <div className="text-2xl font-bold text-slate-900">98%</div>
                                <div className="text-sm text-slate-500">Satisfaction</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Visual/Illustration */}
                    <div className="flex-1 w-full max-w-[500px] lg:max-w-none relative hidden md:block">
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative aspect-square">
                            {/* Abstract Document Representation */}
                            <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl">
                                <rect x="100" y="50" width="300" height="400" rx="20" fill="white" />
                                <rect x="130" y="80" width="240" height="10" rx="5" fill="#E2E8F0" />
                                <rect x="130" y="100" width="180" height="10" rx="5" fill="#E2E8F0" />

                                <rect x="130" y="140" width="240" height="8" rx="4" fill="#F1F5F9" />
                                <rect x="130" y="160" width="200" height="8" rx="4" fill="#F1F5F9" />
                                <rect x="130" y="180" width="220" height="8" rx="4" fill="#F1F5F9" />
                                <rect x="130" y="200" width="190" height="8" rx="4" fill="#F1F5F9" />

                                {/* Score Bubble */}
                                <circle cx="360" cy="380" r="50" fill="#4F46E5" />
                                <text x="360" y="390" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="sans-serif">
                                    95
                                </text>

                                {/* Floating checkmarks */}
                                <g transform="translate(40, 250)">
                                    <circle cx="20" cy="20" r="25" fill="#22C55E" opacity="0.9" />
                                    <path d="M12 20 L18 26 L28 14" stroke="white" strokeWidth="4" fill="none" />
                                </g>
                            </svg>

                            {/* Floating Cards */}
                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute -top-4 -right-4 p-4 bg-white rounded-xl shadow-xl flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">Analyzed</div>
                                    <div className="text-xs text-slate-500">Just now</div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-20 -left-8 p-4 bg-white rounded-xl shadow-xl flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">Responsive</div>
                                    <div className="text-xs text-slate-500">Mobile ready</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
