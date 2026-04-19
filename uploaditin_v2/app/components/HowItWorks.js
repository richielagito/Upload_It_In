"use client";
import React from 'react';
import { UserPlus, Upload, CheckCircle, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    id: 1,
    icon: <UserPlus size={40} />,
    title: "Create Account",
    description: "Register easily using your email to get started."
  },
  {
    id: 2,
    icon: <Upload size={40} />,
    title: "Upload Essay",
    description: "Upload your essay file(s) in supported formats (PDF/DOCX)."
  },
  {
    id: 3,
    icon: <CheckCircle size={40} />,
    title: "Get Grade Result",
    description: "Our AI system will analyze your essay and provide instant feedback."
  },
  {
    id: 4,
    icon: <BarChart size={40} />,
    title: "View Result",
    description: "Access detailed reports, scores, and improvement suggestions."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-surface-low">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 font-headline tracking-tight"
          >
            How It Works
          </motion.h2>
          <p className="text-slate-600 text-lg font-sans">
            Get started in minutes with our streamlined process designed for both teachers and students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-10 rounded-[2.5rem] bg-surface-lowest hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 relative overflow-hidden flex flex-col items-center text-center"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] font-black text-9xl text-primary select-none font-headline">
                {step.id}
              </div>
              
              <div className="w-24 h-24 rounded-[1.5rem] bg-surface-low text-primary flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-container group-hover:text-white group-hover:shadow-xl group-hover:shadow-primary/20">
                {step.icon}
              </div>
              
              <h3 className="text-2xl font-black text-foreground mb-4 font-headline tracking-tight">{step.title}</h3>
              <p className="text-slate-500 text-lg leading-relaxed font-sans font-medium">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
