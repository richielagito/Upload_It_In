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
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            How It Works
          </motion.h2>
          <div className="w-20 h-1.5 bg-blue-600 rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-slate-300 select-none">
                {step.id}
              </div>
              
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
