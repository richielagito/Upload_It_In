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
    <section id="contact" className="py-24 bg-surface-low">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 font-headline tracking-tight"
          >
            Get In Touch
          </motion.h2>
          <p className="text-slate-600 text-lg font-sans">
            Have questions? We're here to help you revolutionize your grading process.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Info Cards */}
            <motion.div 
                 initial={{ opacity: 0, x: -50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="space-y-6"
            >
                <div className="p-10 rounded-[32px] bg-surface-lowest flex items-center gap-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group">
                    <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                        <Mail size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground text-xl mb-1 font-headline">Email Us</h3>
                        <p className="text-slate-500 font-sans">support@uploaditin.com</p>
                    </div>
                </div>
                <div className="p-10 rounded-[32px] bg-surface-lowest flex items-center gap-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group">
                    <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                        <Phone size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground text-xl mb-1 font-headline">Call Us</h3>
                        <p className="text-slate-500 font-sans">+62 123 4567 890</p>
                    </div>
                </div>
                <div className="p-10 rounded-[32px] bg-surface-lowest flex items-center gap-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group">
                    <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                        <MapPin size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground text-xl mb-1 font-headline">Our Office</h3>
                        <p className="text-slate-500 font-sans">Jl. Pendidikan No. 123, Jakarta</p>
                    </div>
                </div>
            </motion.div>

            {/* Form */}
            <motion.div
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="bg-surface-lowest p-12 md:p-16 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]"
            >
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-sm font-black text-foreground font-headline ml-1 uppercase tracking-widest opacity-60">Full Name</label>
                        <input 
                            type="text" 
                            className="w-full px-8 py-5 text-slate-700 bg-surface-low rounded-2xl border-none focus:bg-white focus:ring-[6px] focus:ring-primary/5 outline-none transition-all font-sans font-medium"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-black text-foreground font-headline ml-1 uppercase tracking-widest opacity-60">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full px-8 py-5 text-slate-700 bg-surface-low rounded-2xl border-none focus:bg-white focus:ring-[6px] focus:ring-primary/5 outline-none transition-all font-sans font-medium"
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-black text-foreground font-headline ml-1 uppercase tracking-widest opacity-60">Message</label>
                        <textarea 
                            rows="5"
                            className="w-full px-8 py-5 text-slate-700 bg-surface-low rounded-2xl border-none focus:bg-white focus:ring-[6px] focus:ring-primary/5 outline-none transition-all resize-none font-sans font-medium"
                            placeholder="How can we help you?"
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="w-full py-6 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white font-black text-xl hover:shadow-[0_20px_40px_-10px_rgba(0,61,155,0.3)] transition-all flex items-center justify-center gap-4 font-headline tracking-tight">
                        Send Message <Send size={24} />
                    </button>
                </form>
            </motion.div>
        </div>
      </div>
    </section>
  );
}
