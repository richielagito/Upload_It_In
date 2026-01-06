"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
      await supabase.auth.signOut();
      // Sync logout with Flask backend
      await fetch('/logout');
      window.location.href = "/";
  };

  const navLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-slate-800 flex items-center">
          Upload<span className="text-blue-600">ItIn</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          {session ? (
              <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                      Dashboard
                  </Link>
                   <button onClick={handleLogout} className="text-slate-600 hover:text-red-500 font-medium">Log out</button>
              </div>

          ) : (
            <Link
              href="/login-register"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
            >
              Login / Register
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-slate-800"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl p-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-lg text-slate-700 font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
            <div className="h-px bg-slate-100 my-2" />
             {session ? (
                 <>
                    <Link href="/dashboard" className="w-full text-center py-3 rounded-xl bg-blue-600 text-white font-bold">Dashboard</Link>
                    <button onClick={handleLogout} className="w-full text-center py-3 text-red-500 font-medium">Log out</button>
                 </>
             ) : (
                 <Link
                    href="/login-register"
                    className="w-full text-center py-3 rounded-xl bg-blue-600 text-white font-bold"
                    onClick={() => setIsOpen(false)}
                  >
                    Login / Register
                  </Link>
             )}
        </div>
      )}
    </nav>
  );
}
