"use client";
import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-white py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            {/* Brand */}
            <div className="col-span-1 lg:col-span-2">
                 <Link href="/" className="text-4xl font-extrabold flex items-center mb-8 font-headline tracking-tight">
                    Upload<span className="text-primary-container">ItIn</span>
                </Link>
                <p className="text-slate-400 max-w-sm leading-relaxed font-sans text-lg">
                    The leading AI-powered essay grading platform designed to empower educators and inspire students through instant, objective feedback.
                </p>
            </div>

            {/* Links */}
            <div>
                <h4 className="font-bold text-xl mb-8 font-headline">Quick Links</h4>
                <ul className="space-y-4 font-sans">
                    <li><Link href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</Link></li>
                    <li><Link href="#testimonials" className="text-slate-400 hover:text-white transition-colors">Testimonials</Link></li>
                    <li><Link href="#contact" className="text-slate-400 hover:text-white transition-colors">Contact Support</Link></li>
                    <li><Link href="/login-register" className="text-slate-400 hover:text-white transition-colors">Login / Register</Link></li>
                </ul>
            </div>

            {/* Social */}
            <div>
                <h4 className="font-bold text-xl mb-8 font-headline">Connect</h4>
                <div className="flex gap-4">
                    <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all text-slate-300 hover:text-white">
                        <Facebook size={24} />
                    </a>
                    <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all text-slate-300 hover:text-white">
                        <Twitter size={24} />
                    </a>
                    <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all text-slate-300 hover:text-white">
                        <Instagram size={24} />
                    </a>
                    <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all text-slate-300 hover:text-white">
                        <Linkedin size={24} />
                    </a>
                </div>
            </div>
        </div>

        <div className="bg-white/5 h-[2px] w-full mb-12" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
            <p className="text-slate-500 font-sans font-medium italic">© 2024 UploadItIn. All rights reserved.</p>
            <p className="text-slate-500 flex items-center gap-2 font-sans font-medium">
                The future of essay grading <Heart size={18} className="text-primary fill-current" /> by UploadItIn Team
            </p>
        </div>
      </div>
    </footer>
  );
}
