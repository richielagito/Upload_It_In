"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative pt-32 pb-24 lg:pt-56 lg:pb-40 overflow-hidden bg-background">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Text Content - Intentional Asymmetry */}
                    <div className="flex-[1.2] text-left">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-5xl lg:text-8xl font-extrabold text-foreground leading-[1.1] mb-8 font-headline tracking-tighter max-w-4xl">
                                Revolutionize how you <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-container">Grade Essays</span>
                            </h1>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="max-w-xl mb-12"
                        >
                            <p className="text-xl text-slate-600 leading-relaxed font-sans font-medium">
                                Leverage AI for speed and reliability. UploadItIn transforms how you evaluate essays — making the process faster, smarter, and more objective than ever.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.6, delay: 0.3 }} 
                            className="flex flex-wrap gap-5"
                        >
                            <Link href="/login-register" className="px-10 py-5 rounded-[1.5rem] bg-gradient-to-br from-primary to-primary-container text-white font-bold text-xl hover:shadow-[0_20px_40px_-10px_rgba(0,61,155,0.3)] transition-all flex items-center gap-3">
                                Start Now <ArrowRight size={24} />
                            </Link>
                            <Link href="#how-it-works" className="px-10 py-5 rounded-[1.5rem] bg-surface-lowest text-slate-700 font-bold text-xl shadow-sm hover:shadow-xl transition-all flex items-center gap-3">
                                <Play size={24} className="fill-current text-primary" /> How It Works
                            </Link>
                        </motion.div>

                        {/* Stats - Tonal Layering */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.6, delay: 0.4 }} 
                            className="grid grid-cols-3 gap-6 mt-20 max-w-2xl"
                        >
                            <div className="p-6 rounded-3xl bg-surface-low/50">
                                <div className="text-3xl lg:text-4xl font-black text-foreground font-headline tracking-tight">1000+</div>
                                <div className="text-sm text-slate-500 font-sans font-bold uppercase tracking-wider mt-1">Essays</div>
                            </div>
                            <div className="p-6 rounded-3xl bg-surface-low/50">
                                <div className="text-3xl lg:text-4xl font-black text-foreground font-headline tracking-tight">500+</div>
                                <div className="text-sm text-slate-500 font-sans font-bold uppercase tracking-wider mt-1">Users</div>
                            </div>
                            <div className="p-6 rounded-3xl bg-surface-low/50">
                                <div className="text-3xl lg:text-4xl font-black text-foreground font-headline tracking-tight">98%</div>
                                <div className="text-sm text-slate-500 font-sans font-bold uppercase tracking-wider mt-1">Satisfied</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Visual/Illustration */}
                    <div className="flex-1 w-full max-w-[600px] lg:max-w-none relative">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, rotate: 2 }} 
                            animate={{ opacity: 1, scale: 1, rotate: 0 }} 
                            transition={{ duration: 1 }} 
                            className="relative aspect-square"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-[100px] opacity-60" />
                            
                            <div className="relative z-10 bg-surface-lowest rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-12 overflow-hidden h-full flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="w-2/3 h-4 rounded-full bg-surface-low" />
                                    <div className="w-1/2 h-4 rounded-full bg-surface-low" />
                                    <div className="space-y-3 pt-8">
                                        <div className="w-full h-2 rounded-full bg-surface-low/60" />
                                        <div className="w-full h-2 rounded-full bg-surface-low/60" />
                                        <div className="w-4/5 h-2 rounded-full bg-surface-low/60" />
                                        <div className="w-full h-2 rounded-full bg-surface-low/60" />
                                    </div>
                                </div>

                                <div className="flex items-end justify-between">
                                     <div className="space-y-4">
                                         <div className="flex gap-2">
                                             <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                                                 <CheckCircle size={16} />
                                             </div>
                                             <div className="w-24 h-4 rounded-full bg-surface-low mt-2" />
                                         </div>
                                         <div className="flex gap-2">
                                             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                 <Smartphone size={16} />
                                             </div>
                                             <div className="w-32 h-4 rounded-full bg-surface-low mt-2" />
                                         </div>
                                     </div>
                                     
                                     <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-2xl shadow-primary/40 group">
                                         <span className="text-5xl font-black text-white font-headline">95</span>
                                     </div>
                                </div>
                            </div>

                            {/* Floating Card - AI Intelligence */}
                            <motion.div 
                                animate={{ y: [0, -20, 0], x: [0, 5, 0] }} 
                                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} 
                                className="absolute -top-8 -right-8 p-6 bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-5 z-20"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-lg">
                                    <CheckCircle size={28} />
                                </div>
                                <div>
                                    <div className="font-black text-foreground font-headline text-lg">AI Logic</div>
                                    <div className="text-sm text-slate-500 font-sans font-medium italic">Highly Accurate</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
