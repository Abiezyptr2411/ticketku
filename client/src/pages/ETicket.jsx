import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Train, Download } from 'lucide-react';

export default function ETicket() {
    const navigate = useNavigate();
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

    if (!booking) return <div className="text-center py-20 font-bold">Generating E-Ticket...</div>;

    const bCode = booking.bookingCode;
    const schedule = booking.schedule;
    
    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-28 animate-in fade-in duration-500 pt-6 px-4">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <button type="button" onClick={() => navigate('/my-tickets')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-secondary bg-white shadow-sm border border-border">
                        ← 
                    </button>
                    <h1 className="text-xl font-bold">E-Ticket</h1>
                </div>
                <button className="flex items-center space-x-2 text-primary bg-primary-light/50 px-4 py-2 rounded-xl border border-primary/20 text-sm font-bold hover:bg-primary hover:text-white transition-colors">
                    <Download size={16} />
                    <span>Download</span>
                </button>
            </div>

            <div className="bg-white rounded-[2rem] shadow-lg border border-border overflow-hidden">
                {/* Top Banner */}
                <div className="bg-gradient-to-r from-primary to-[#4B1FD1] py-4 text-center text-white font-black tracking-[0.3em] uppercase">
                    E-TICKET
                </div>
                
                <div className="p-8">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Booking Code</p>
                            <h2 className="text-xl font-black mt-1 tracking-widest">{bCode}</h2>
                        </div>
                        <div className="text-right">
                             <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Status</p>
                             <span className="text-[11px] font-bold uppercase tracking-wider text-[#00b368] mt-1 bg-[#00b368]/10 inline-block px-3 py-1 rounded-full border border-[#00b368]/20">{booking.bookingStatus}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-8 relative">
                        <div className="w-full absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-border to-transparent"></div>
                        
                        <div className="bg-white pr-4 relative z-10">
                            <p className="font-bold text-lg">{schedule?.departureStation?.city} ({schedule?.departureStation?.code})</p>
                            <p className="text-sm text-text-secondary">{schedule?.departureStation?.name}</p>
                            <h3 className="text-2xl font-black mt-3">{schedule?.departureTime ? new Date(schedule.departureTime).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) : ''}</h3>
                            <p className="text-xs font-semibold text-text-secondary mt-1">{schedule?.departureTime ? new Date(schedule.departureTime).toLocaleDateString('en-GB') : ''}</p>
                        </div>
                         
                        <div className="bg-white px-4 relative z-10 text-primary">
                            <Train size={32} />
                        </div>

                        <div className="bg-white pl-4 relative z-10 text-right">
                            <p className="font-bold text-lg">{schedule?.arrivalStation?.city} ({schedule?.arrivalStation?.code})</p>
                            <p className="text-sm text-text-secondary">{schedule?.arrivalStation?.name}</p>
                            <h3 className="text-2xl font-black mt-3">{schedule?.arrivalTime ? new Date(schedule.arrivalTime).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) : ''}</h3>
                            <p className="text-xs font-semibold text-text-secondary mt-1">{schedule?.arrivalTime ? new Date(schedule.arrivalTime).toLocaleDateString('en-GB') : ''}</p>
                        </div>
                    </div>

                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pt-6 border-t border-dashed border-border text-center md:text-left">
                        <div>
                            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Train</p>
                            <p className="font-bold mt-1 text-sm">{schedule?.train?.name}</p>
                            <p className="text-xs text-primary font-medium">{schedule?.train?.class}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Coach</p>
                            <p className="font-bold mt-1 text-lg">1</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Seat</p>
                            <p className="font-bold mt-1 text-lg text-primary">{booking.seats?.map(s => s.seatNumber).join(', ') || '-'}</p>
                        </div>
                     </div>

                     <div className="pt-8 border-t-[3px] border-dotted border-border flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="flex-1 w-full space-y-4">
                              <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Passenger</p>
                              {booking.passengers?.map((pax, i) => (
                                  <div key={i} className="bg-gray-50/50 p-3 rounded-xl border border-border/50">
                                    <p className="font-bold text-sm">{i+1}. {pax.fullName} (Adult)</p>
                                  </div>
                              ))}
                          </div>
                         <div className="flex flex-col items-center">
                             <div className="bg-white p-3 border-2 border-border rounded-2xl shadow-sm">
                                <QRCode value={bCode} size={120} />
                             </div>
                             <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-3">Scan at the gate</p>
                         </div>
                     </div>
                </div>
                
                <div className="bg-primary-light/30 py-3 text-center border-t border-border">
                    <p className="text-xs font-semibold text-primary">Please arrive at the station at least 30 minutes before departure.</p>
                </div>
            </div>
            <div className="text-center pt-4">
                 <button onClick={() => navigate('/')} className="text-text-secondary hover:text-primary transition-colors text-sm font-semibold">
                    Back to Home
                </button>
            </div>
        </div>
    );
}
