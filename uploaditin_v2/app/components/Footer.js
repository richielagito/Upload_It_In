"use client";
import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1 lg:col-span-2">
                 <Link href="/" className="text-3xl font-bold flex items-center mb-6">
                    Upload<span className="text-blue-500">ItIn</span>
                </Link>
                <p className="text-slate-400 max-w-sm leading-relaxed">
                    UploadItIn is the leading AI-powered essay grading platform designed to help educators and students achieve more in less time.
                </p>
            </div>

            {/* Links */}
            <div>
                <h4 className="font-bold text-lg mb-6">Quick Links</h4>
                <ul className="space-y-4">
                    <li><Link href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</Link></li>
                    <li><Link href="#testimonials" className="text-slate-400 hover:text-white transition-colors">Testimonials</Link></li>
                    <li><Link href="#contact" className="text-slate-400 hover:text-white transition-colors">Contact Support</Link></li>
                    <li><Link href="/login-register" className="text-slate-400 hover:text-white transition-colors">Login / Register</Link></li>
                </ul>
            </div>

            {/* Social */}
            <div>
                <h4 className="font-bold text-lg mb-6">Connect</h4>
                <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-all text-slate-300 hover:text-white">
                        <Facebook size={20} />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 transition-all text-slate-300 hover:text-white">
                        <Twitter size={20} />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 transition-all text-slate-300 hover:text-white">
                        <Instagram size={20} />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-700 transition-all text-slate-300 hover:text-white">
                        <Linkedin size={20} />
                    </a>
                </div>
            </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500">© 2024 UploadItIn. All rights reserved.</p>
            <p className="text-slate-500 flex items-center gap-1">
                Made with <Heart size={16} className="text-red-500 fill-current" /> by UploadItIn Team
            </p>
        </div>
      </div>
    </footer>
  );
}
