"use client";
import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent! (Demo)");
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
           <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            Contact Us
          </motion.h2>
          <div className="w-20 h-1.5 bg-blue-600 rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Info Cards */}
            <motion.div 
                 initial={{ opacity: 0, x: -50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="grid grid-cols-1 gap-6"
            >
                <div className="p-8 rounded-2xl bg-slate-50 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Mail size={28} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">Email</h3>
                        <p className="text-slate-600">support@essaygrader.com</p>
                    </div>
                </div>
                <div className="p-8 rounded-2xl bg-slate-50 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Phone size={28} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">Phone</h3>
                        <p className="text-slate-600">+62 123 4567 890</p>
                    </div>
                </div>
                <div className="p-8 rounded-2xl bg-slate-50 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <MapPin size={28} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">Address</h3>
                        <p className="text-slate-600">Jl. Pendidikan No. 123<br />Jakarta, Indonesia</p>
                    </div>
                </div>
            </motion.div>

            {/* Form */}
            <motion.div
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 text-slate-600 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-3 text-slate-600 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                        <textarea 
                            rows="4"
                            className="w-full px-4 py-3 text-slate-600 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                            placeholder="How can we help you?"
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                        Send Message <Send size={20} />
                    </button>
                </form>
            </motion.div>
        </div>
      </div>
    </section>
  );
}
