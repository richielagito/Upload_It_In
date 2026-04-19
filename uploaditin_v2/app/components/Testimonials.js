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
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 font-headline tracking-tight"
          >
            Voices from Our Community
          </motion.h2>
          <p className="text-slate-600 text-lg font-sans">
            Hear from educators and students who are transforming their learning experience with UploadItIn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-surface-lowest p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 relative flex flex-col justify-between h-full group"
                >
                    <Quote className="absolute top-12 right-12 text-primary opacity-[0.05] w-24 h-24 -z-0 group-hover:opacity-10 transition-opacity duration-500" />
                    
                    <div className="relative z-10 flex-1">
                        <p className="text-foreground text-xl mb-12 italic leading-relaxed font-sans font-semibold tracking-tight">"{item.quote}"</p>
                    </div>

                    <div className="relative z-10 flex items-center gap-5 pt-10">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=003d9b&color=ffffff`} 
                            alt={item.name}
                            className="w-16 h-16 rounded-2xl shadow-lg shadow-primary/10"
                        />
                        <div>
                            <h4 className="font-black text-foreground font-headline text-xl tracking-tight">{item.name}</h4>
                            <p className="text-xs text-primary font-black font-sans tracking-[0.15em] uppercase mt-1">{item.role}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
