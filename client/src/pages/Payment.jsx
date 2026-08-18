import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Wallet, QrCode, CreditCard, Landmark } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

export default function Payment() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [method, setMethod] = useState('');
    const [processing, setProcessing] = useState(false);
    const bookingId = localStorage.getItem('active_booking_id');
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const api = (await import('../services/api')).default;
                const res = await api.get(`/bookings/${bookingId}`);
                setBooking(res.data);
            } catch(e) { console.error(e); }
        };
        if(bookingId) fetchBooking();
    }, [bookingId]);

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    const handlePayNow = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            if (bookingId) {
                const api = (await import('../services/api')).default;
                await api.post(`/bookings/${bookingId}/payment`, { status: 'success' });
                if (method === 'RailwayPay') await refreshUser();
            }
            // Mock realistic processing delay
            setTimeout(() => navigate('/e-ticket'), 1000);
        } catch (error) {
            console.error('Payment failed', error);
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6 pb-28 animate-in fade-in duration-500 pt-6 px-4">
             <div className="flex items-center space-x-4 mb-8">
                <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-secondary bg-white shadow-sm border border-border">
                    ← 
                </button>
                <h1 className="text-xl font-bold">Select Payment</h1>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-text-secondary font-medium">Total Payment</span>
                    <span className="text-2xl font-black text-primary">{booking ? formatPrice(booking.totalPrice) : 'Loading...'}</span>
                </div>
                
                <h3 className="font-bold mb-4 mt-6 border-t border-border pt-6 text-[11px] uppercase tracking-wider text-text-secondary">E-Wallet</h3>
                <div className="space-y-4">
                    <label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${method === 'RailwayPay' ? 'border-primary bg-primary-light/30 shadow-md shadow-primary/10' : 'border-border/50 hover:border-primary/30'} `}>
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-primary to-[#4B1FD1] text-white rounded-[14px] shadow-sm"><Wallet size={20} /></div>
                            <div>
                                <span className="font-bold text-[15px] block">RailwayPay</span>
                                <span className="text-xs text-text-secondary block mt-0.5">Balance: Rp 250.000 <span className="text-red-500">(Insufficient)</span></span>
                            </div>
                        </div>
                        <input type="radio" name="method" value="RailwayPay" disabled onChange={(e) => setMethod(e.target.value)} className="w-5 h-5 accent-primary" />
                    </label>
                </div>

                <h3 className="font-bold mb-4 mt-6 border-t border-border pt-6 text-[11px] uppercase tracking-wider text-text-secondary">Instant Payment</h3>
                <div className="space-y-4">
                    <label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${method === 'QRIS' ? 'border-primary bg-primary-light/30 shadow-md shadow-primary/10' : 'border-border/50 hover:border-primary/30'} `}>
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-[14px] border border-blue-100"><QrCode size={20} /></div>
                            <span className="font-bold text-[15px]">QRIS (E-Wallet & Bank App)</span>
                        </div>
                        <input type="radio" name="method" value="QRIS" onChange={(e) => setMethod(e.target.value)} className="w-5 h-5 accent-primary" />
                    </label>
                </div>

                 <h3 className="font-bold mb-4 mt-6 border-t border-border pt-6 text-[11px] uppercase tracking-wider text-text-secondary">Virtual Account & Transfer</h3>
                <div className="space-y-4">
                    <label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${method === 'Virtual Account' ? 'border-primary bg-primary-light/30 shadow-md shadow-primary/10' : 'border-border/50 hover:border-primary/30'} `}>
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-50 text-green-500 rounded-[14px] border border-green-100"><CreditCard size={20} /></div>
                            <span className="font-bold text-[15px]">BCA Virtual Account</span>
                        </div>
                        <input type="radio" name="method" value="Virtual Account" onChange={(e) => setMethod(e.target.value)} className="w-5 h-5 accent-primary" />
                    </label>
                    <label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${method === 'Bank Transfer' ? 'border-primary bg-primary-light/30 shadow-md shadow-primary/10' : 'border-border/50 hover:border-primary/30'} `}>
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-orange-50 text-orange-500 rounded-[14px] border border-orange-100"><Landmark size={20} /></div>
                            <span className="font-bold text-[15px]">Mandiri Virtual Account</span>
                        </div>
                        <input type="radio" name="method" value="Bank Transfer" onChange={(e) => setMethod(e.target.value)} className="w-5 h-5 accent-primary" />
                    </label>
                </div>
            </div>

            {/* Bottom Sticky Action */}
            <div className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-white border-t border-border shadow-[0_-10px_30px_rgba(0,0,0,0.08)] px-4 py-4 sm:px-6 z-50 rounded-t-[2rem]">
                <button 
                    onClick={handlePayNow}
                    disabled={!method || processing}
                    className="w-full btn-primary px-8 py-4 text-[16px] tracking-wide font-bold shadow-xl shadow-primary/30 rounded-xl flex justify-center items-center disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    {processing ? (
                        <>
                            <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                            Processing...
                        </>
                    ) : (
                        <>Pay {booking ? formatPrice(booking.totalPrice) : ''} Now</>
                    )}
                </button>
            </div>
        </div>
    );
}
