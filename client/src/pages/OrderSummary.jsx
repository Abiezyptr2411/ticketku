import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Train, Calendar, Clock, MapPin, Users, Ticket, Wallet } from 'lucide-react';

export default function OrderSummary() {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Dynamic Data
    const scheduleId = localStorage.getItem('booking_schedule_id');
    const savedPax = localStorage.getItem('booking_pax') || 1;
    const paxCount = parseInt(savedPax, 10);
    const savedPassengers = JSON.parse(localStorage.getItem('booking_passengers')) || [];
    const savedSeats = JSON.parse(localStorage.getItem('booking_seats')) || [];
    
    const [schedule, setSchedule] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const api = (await import('../services/api')).default;
                const res = await api.get(`/schedules/${scheduleId}`);
                setSchedule(res.data);
            } catch(e) { console.error(e); }
        };
        if(scheduleId) fetchData();
    }, [scheduleId]);

    const price = schedule?.price || 0;
    const adminFee = 2500;
    const total = (price * paxCount) + adminFee;

    const handlePayment = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const res = await api.post('/bookings', {
                scheduleId: scheduleId,
                passengers: savedPassengers,
                selectedSeats: savedSeats,
                price,
                adminFee,
                totalPrice: total,
                paymentMethod: 'Virtual Account'
            });
            localStorage.setItem('active_booking_id', res.data._id);
            navigate('/payment');
        } catch (error) {
            console.error('Booking failed', error);
            setProcessing(false);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-32 animate-in fade-in duration-500 pt-6 px-4">
            <div className="flex items-center space-x-4 mb-2">
                <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-secondary bg-white shadow-sm border border-border">
                    ← 
                </button>
                <h1 className="text-xl font-bold">Order Summary</h1>
            </div>

            <div className="space-y-6 mt-6">
                {/* Train Info */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 text-primary opacity-[0.03]">
                        <Train size={150} />
                    </div>
                    <h2 className="font-bold mb-5 flex items-center space-x-2"><Train size={18} className="text-primary" /><span>Train Route</span></h2>
                    <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-2xl border border-border flex flex-col sm:flex-row justify-between sm:items-center relative z-10 gap-4">
                        <div>
                            <h3 className="font-black text-lg">{schedule?.train?.name || 'Loading'} ({schedule?.train?.code || ''})</h3>
                            <p className="text-sm font-semibold text-primary mt-1">{schedule?.train?.class || ''} ({schedule?.train?.type || ''})</p>
                        </div>
                        <div className="sm:text-right">
                            <p className="font-bold flex items-center sm:justify-end space-x-2 text-sm">
                                <Calendar size={14} className="text-text-secondary" />
                                <span>{schedule?.departureTime ? new Date(schedule.departureTime).toLocaleDateString('en-GB') : '-'}</span>
                            </p>
                            <p className="text-primary font-bold text-lg mt-1 flex items-center sm:justify-end space-x-2">
                                <Clock size={16} />
                                <span>{schedule?.departureTime ? new Date(schedule.departureTime).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) : '-'} - {schedule?.arrivalTime ? new Date(schedule.arrivalTime).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) : '-'}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Passenger & Seats Info */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border relative overflow-hidden">
                    <h2 className="font-bold mb-5 flex items-center space-x-2"><Ticket size={18} className="text-primary" /><span>Booking Details</span></h2>
                    <div className="space-y-4">
                        {savedPassengers.map((pax, i) => (
                            <div key={i} className="bg-gray-50/50 p-4 rounded-3xl border border-border/80 flex items-center space-x-4 hover:border-primary/30 transition-colors">
                                 <div className="bg-orange-50 p-3 rounded-full text-orange-500 shadow-sm border border-orange-100"><Users size={20} /></div>
                                 <div className="flex-1">
                                    <h4 className="font-bold text-[15px]">{pax.fullName || `Passenger ${i+1}`}</h4>
                                    <p className="text-[11px] font-semibold tracking-wide uppercase text-text-secondary mt-1">Adult • {pax.idNumber}</p>
                                 </div>
                                 <div className="text-right">
                                    <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest block mb-0.5">Seat</span>
                                    <span className="font-black text-lg text-primary">{savedSeats[i] || '-'}</span>
                                 </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Breakdown */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border">
                    <h2 className="font-bold mb-5 flex items-center space-x-2"><Wallet size={18} className="text-primary" /><span>Payment Details</span></h2>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-text-secondary">{schedule?.train?.name} (Adult) x{paxCount}</span>
                            <span className="font-bold">{formatPrice(price * paxCount)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-text-secondary">Admin Fee</span>
                            <span className="font-bold">{formatPrice(adminFee)}</span>
                        </div>
                    </div>
                    
                    <div className="pt-5 border-t-2 border-dashed border-border flex justify-between items-end">
                        <span className="font-bold text-text-secondary">Total Final</span>
                        <span className="text-3xl font-black text-primary tracking-tight">{formatPrice(total)}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Sticky Action */}
            <div className="fixed bottom-0 left-0 right-0 max-w-3xl mx-auto bg-white border-t border-border shadow-[0_-10px_30px_rgba(0,0,0,0.08)] px-4 py-4 sm:px-6 flex justify-between items-center z-50 rounded-t-[2rem]">
                <div className="hidden sm:block">
                    <p className="text-[11px] text-text-secondary font-bold tracking-wider uppercase">Total Price</p>
                    <h2 className="text-2xl font-black text-text-primary tracking-tight mt-0.5">{formatPrice(total)}</h2>
                </div>
                <button 
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full sm:w-auto flex-1 sm:flex-none btn-primary px-10 py-3.5 text-[15px] tracking-wide font-bold shadow-xl shadow-primary/30 rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                >
                    {processing ? 'Processing...' : 'Proceed to Payment'}
                </button>
            </div>
        </div>
    );
}
