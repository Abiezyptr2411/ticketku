import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, ChevronRight } from 'lucide-react';

export default function MyTickets() {
    const navigate = useNavigate();
    
    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-28 animate-in fade-in duration-500 pt-6 px-4">
             <div className="flex items-center space-x-4 mb-8">
                <button type="button" onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-secondary bg-white shadow-sm border border-border">
                    ← 
                </button>
                <h1 className="text-xl font-bold">My Tickets</h1>
            </div>

            <div className="space-y-4">
                <div 
                    onClick={() => navigate('/e-ticket')}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-border hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-center mb-4 border-b border-border/50 pb-4">
                        <div className="flex items-center space-x-3">
                            <span className="text-[10px] font-bold py-1 px-3 bg-gradient-to-r from-primary to-[#4B1FD1] text-white rounded-full tracking-widest uppercase">E-TICKET</span>
                            <span className="text-sm font-bold text-text-secondary">RAIL-20260818-00001</span>
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#00b368] bg-[#00b368]/10 px-3 py-1 rounded-full border border-[#00b368]/20">PAID</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                             <div className="w-12 h-12 rounded-2xl bg-primary-light/50 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
                                <Train size={24} />
                             </div>
                             <div>
                                <h3 className="font-bold text-lg tracking-tight">ARGO SEMERU (6)</h3>
                                <p className="text-sm font-medium text-text-secondary mt-0.5">Jakarta → Yogyakarta</p>
                                <p className="text-xs font-semibold text-text-secondary mt-1">18 Aug 2026 • 06:20</p>
                             </div>
                        </div>
                        <div className="text-primary opacity-50 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                            <ChevronRight size={24} />
                        </div>
                    </div>
                </div>

                 <div 
                    className="bg-white rounded-3xl p-6 shadow-sm border border-border opacity-70"
                >
                    <div className="flex justify-between items-center mb-4 border-b border-border/50 pb-4">
                        <div className="flex items-center space-x-3">
                            <span className="text-[10px] font-bold py-1 px-3 bg-gray-200 text-gray-500 rounded-full tracking-widest uppercase">E-TICKET</span>
                            <span className="text-sm font-bold text-text-secondary">RAIL-20240101-08922</span>
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">COMPLETED</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                             <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center border border-gray-200">
                                <Train size={24} />
                             </div>
                             <div>
                                <h3 className="font-bold text-lg tracking-tight text-gray-500">TAKSAKA</h3>
                                <p className="text-sm font-medium text-gray-400 mt-0.5">Yogyakarta → Jakarta</p>
                                <p className="text-xs font-semibold text-gray-400 mt-1">1 Jan 2024 • 14:15</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
