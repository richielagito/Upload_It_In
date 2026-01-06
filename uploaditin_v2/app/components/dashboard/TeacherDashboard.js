"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, BookOpen, ArrowRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function TeacherDashboard({ user }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [createdClassCode, setCreatedClassCode] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
        const formData = new FormData();
        formData.append('class_name', newClassName);
        
        const res = await fetch('/create-class', {
            method: 'POST',
            body: formData
        });
        
        if (res.ok) {
            const data = await res.json();
            setCreatedClassCode(data.class_code);
            fetchClasses(); // Refresh list
            toast.success("Class created successfully!");
        } else {
            toast.error("Failed to create class");
        }
    } catch (error) {
        console.error(error);
        toast.error("Error creating class");
    } finally {
        setCreating(false);
    }
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setNewClassName('');
      setCreatedClassCode(null);
  }

  return (
    <div>
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
         <div>
            <h1 className="text-2xl font-bold text-slate-900">My Classes</h1>
            <p className="text-slate-500">Manage your classes and assignments</p>
         </div>
         <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 font-medium"
         >
            <Plus size={20} /> Create Class
         </button>
       </div>

       {loading ? (
           <div className="flex items-center justify-center py-20">
               <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
           </div>
       ) : classes.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
               <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                   <BookOpen size={32} />
               </div>
               <h3 className="text-lg font-bold text-slate-900 mb-2">No Classes Yet</h3>
               <p className="text-slate-500 mb-6">Create your first class to get started.</p>
               <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-blue-600 font-bold hover:underline"
                >
                    Create Class Now
                </button>
           </div>
       ) : (
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                   <table className="w-full text-left">
                       <thead className="bg-slate-50 border-b border-slate-200">
                           <tr>
                               <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Class Name</th>
                               <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Class Code</th>
                               <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Created At</th>
                               <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Action</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {classes.map((cls) => (
                               <tr key={cls.id} className="hover:bg-slate-50 transition-colors group">
                                   <td className="px-6 py-4 font-medium text-slate-900">{cls.nama_kelas}</td>
                                   <td className="px-6 py-4 text-blue-600 font-mono bg-blue-50/50 w-fit rounded">{cls.kode_kelas}</td>
                                   <td className="px-6 py-4 text-slate-500 text-sm">{cls.created_at}</td>
                                   <td className="px-6 py-4 text-right">
                                       <Link href={`/kelas/${cls.kode_kelas}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm">
                                           View Details <ArrowRight size={16} />
                                       </Link>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </div>
       )}

       {/* Create Class Modal */}
       {isModalOpen && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
               >
                   <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                       <h3 className="text-xl font-bold text-slate-900">Create New Class</h3>
                       <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                           <X size={24} />
                       </button>
                   </div>
                   
                   <div className="p-6">
                       {!createdClassCode ? (
                           <form onSubmit={handleCreateClass} className="space-y-4">
                               <div>
                                   <label className="block text-sm font-medium text-slate-700 mb-2">Class Name</label>
                                   <input 
                                        type="text" 
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                        className="w-full px-4 py-3 text-slate-600 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        placeholder="e.g. Bahasa Indonesia X-A"
                                        required
                                   />
                               </div>
                               <button 
                                    type="submit" 
                                    disabled={creating}
                                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center justify-center"
                                >
                                    {creating ? "Creating..." : "Create Class"}
                                </button>
                           </form>
                       ) : (
                           <div className="text-center py-4">
                               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                   <BookOpen size={32} />
                               </div>
                               <h4 className="text-lg font-bold text-slate-900 mb-2">Class Created!</h4>
                               <p className="text-slate-500 mb-4">Share this code with your students:</p>
                               <div className="bg-slate-100 p-4 rounded-xl font-mono text-2xl font-bold text-slate-800 tracking-wider mb-6 select-all">
                                   {createdClassCode}
                               </div>
                               <button 
                                    onClick={closeModal}
                                    className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all"
                                >
                                    Close
                                </button>
                           </div>
                       )}
                   </div>
               </motion.div>
           </div>
       )}
    </div>
  );
}
