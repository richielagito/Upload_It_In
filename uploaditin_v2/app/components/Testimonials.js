"use client";
import React from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const defaultTestimonials = [
    {
        name: "Budi Santoso",
        role: "Guru Bahasa Indonesia",
        quote: "UploadItIn sangat membantu saya dalam mengoreksi tugas murid dengan cepat dan akurat."
    },
    {
        name: "Siti Aminah",
        role: "Dosen Sastra",
        quote: "Fitur analisisnya sangat mendalam. Saya bisa memberikan feedback yang lebih baik ke mahasiswa."
    },
    {
        name: "Rudi Hermawan",
        role: "Siswa SMA",
        quote: "Nilai saya meningkat karena saya tahu di mana letak kesalahan essay saya sebelum dikumpulkan."
    }
];

export default function Testimonials({ data = defaultTestimonials }) {
  return (
    <section id="testimonials" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            User Testimonials
          </motion.h2>
          <div className="w-20 h-1.5 bg-blue-600 rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative"
                >
                    <Quote className="absolute top-6 left-6 text-blue-100 w-12 h-12 -z-0" />
                    
                    <div className="relative z-10">
                        <p className="text-slate-600 mb-8 italic leading-relaxed">"{item.quote}"</p>
                        
                        <div className="flex items-center gap-4">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${item.name.replace(' ', '+')}&background=random`} 
                                alt={item.name}
                                className="w-12 h-12 rounded-full ring-2 ring-white shadow-md"
                            />
                            <div>
                                <h4 className="font-bold text-slate-900">{item.name}</h4>
                                <p className="text-sm text-blue-600 font-medium">{item.role}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
