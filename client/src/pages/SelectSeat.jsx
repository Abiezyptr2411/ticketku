import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

export default function SelectSeat() {
    const navigate = useNavigate();
    const savedPax = localStorage.getItem('booking_pax') || 1;
    const paxCount = parseInt(savedPax, 10); // Dynamic pax count
    const scheduleId = localStorage.getItem('booking_schedule_id');
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [socket, setSocket] = useState(null);
    const [seats, setSeats] = useState([]);
    const [schedule, setSchedule] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
             try {
                 const api = (await import('../services/api')).default;
                 const [schRes, seatRes] = await Promise.all([
                     api.get(`/schedules/${scheduleId}`),
                     api.get(`/seats/schedule/${scheduleId}`)
                 ]);
                 setSchedule(schRes.data);
                 setSeats(seatRes.data || []);
             } catch(err) { console.error(err); }
        };
        if(scheduleId) fetchData();
    }, [scheduleId]);

    const handleSeatClick = (seat) => {
        if (seat.status === 'BOOKED' || seat.status === 'LOCKED') return;
        
        if (selectedSeats.includes(seat.seatNumber)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seat.seatNumber));
        } else {
            if (selectedSeats.length < paxCount) {
                setSelectedSeats([...selectedSeats, seat.seatNumber]);
            }
        }
    };

    const getSeatColor = (seatNumber) => {
        const seat = seats.find(s => s.seatNumber === seatNumber);
        if (!seat) return 'bg-gray-100 text-gray-400';
        
        if (selectedSeats.includes(seatNumber)) return 'bg-primary text-white border-primary shadow-md shadow-primary/30';
        if (seat.status === 'BOOKED') return 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed line-through';
        if (seat.status === 'LOCKED') return 'bg-orange-100 text-orange-400 border-orange-200 cursor-not-allowed';
        return 'bg-white text-text-primary border-border hover:border-primary hover:text-primary transition-colors cursor-pointer text-text-secondary font-medium';
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-32 animate-in fade-in duration-500 pt-6 px-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                    <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-secondary bg-white shadow-sm border border-border">
                        ← 
                    </button>
                    <div>
                        <h1 className="text-xl font-black">Select Seat</h1>
                        <p className="text-xs font-semibold text-text-secondary mt-1">
                            {schedule ? `${schedule.train?.name} (${schedule.train?.code}) • ${schedule.departureStation?.city} → ${schedule.arrivalStation?.city}` : 'Loading...'}
                        </p>
                    </div>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-bold border border-primary/20">
                    {selectedSeats.length} / {paxCount} Selected
                </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center space-x-6 text-xs font-bold text-text-secondary bg-white p-4 rounded-2xl shadow-sm border border-border mt-6">
                <div className="flex items-center"><div className="w-4 h-4 border-2 border-border rounded mr-2 bg-white"></div> Available</div>
                <div className="flex items-center"><div className="w-4 h-4 bg-primary rounded mr-2 border border-primary"></div> Selected</div>
                <div className="flex items-center"><div className="w-4 h-4 bg-gray-200 rounded mr-2 border border-gray-200"></div> Booked</div>
                <div className="flex items-center"><div className="w-4 h-4 bg-orange-100 rounded mr-2 border border-orange-200"></div> Locked</div>
            </div>

            {/* Coach View */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-lg border border-border relative overflow-hidden mt-6 mb-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gray-100 rounded-b-xl border-b border-x border-border flex items-center justify-center">
                    <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                </div>
                
                <h2 className="text-center font-black text-lg mb-8 mt-4 tracking-wide">COACH 1 <span className="text-primary">({schedule?.train?.class || ''})</span></h2>
                
                <div className="flex justify-between items-center px-2 mb-6 text-[10px] font-black text-text-secondary/60 uppercase tracking-[0.2em]">
                    <span className="w-24 text-center">Window</span>
                    <span className="w-8 text-center flex-1">Aisle</span>
                    <span className="w-24 text-center">Window</span>
                </div>

                <div className="space-y-4">
                    {[1,2,3,4,5,6,7,8,9,10].map(row => (
                        <div key={row} className="flex justify-between items-center px-2">
                            <div className="w-6 text-center text-xs font-black text-text-secondary/40 mr-2">{row}</div>
                            <div className="flex space-x-3 sm:space-x-4">
                                <div onClick={() => handleSeatClick({seatNumber: `A${row}`, status: seats.find(s=>s.seatNumber===`A${row}`)?.status })} className={`w-10 h-12 sm:w-12 sm:h-14 rounded-[14px] flex items-center justify-center text-[13px] border-[2.5px] transition-all transform active:scale-95 ${getSeatColor(`A${row}`)}`}>
                                    A{row}
                                </div>
                                <div onClick={() => handleSeatClick({seatNumber: `B${row}`, status: seats.find(s=>s.seatNumber===`B${row}`)?.status })} className={`w-10 h-12 sm:w-12 sm:h-14 rounded-[14px] flex items-center justify-center text-[13px] border-[2.5px] transition-all transform active:scale-95 ${getSeatColor(`B${row}`)}`}>
                                    B{row}
                                </div>
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="w-1 h-1 bg-border rounded-full"></div>
                            </div>
                            <div className="flex space-x-3 sm:space-x-4">
                                <div onClick={() => handleSeatClick({seatNumber: `C${row}`, status: seats.find(s=>s.seatNumber===`C${row}`)?.status })} className={`w-10 h-12 sm:w-12 sm:h-14 rounded-[14px] flex items-center justify-center text-[13px] border-[2.5px] transition-all transform active:scale-95 ${getSeatColor(`C${row}`)}`}>
                                    C{row}
                                </div>
                                <div onClick={() => handleSeatClick({seatNumber: `D${row}`, status: seats.find(s=>s.seatNumber===`D${row}`)?.status })} className={`w-10 h-12 sm:w-12 sm:h-14 rounded-[14px] flex items-center justify-center text-[13px] border-[2.5px] transition-all transform active:scale-95 ${getSeatColor(`D${row}`)}`}>
                                    D{row}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Sticky Action */}
            <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-border shadow-[0_-10px_30px_rgba(0,0,0,0.08)] px-4 py-4 sm:px-6 flex justify-between items-center z-50 rounded-t-[2rem]">
                <div className="flex-1 mr-4">
                    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Selected ({selectedSeats.length})</p>
                    <h2 className="text-xl font-black text-primary tracking-tight truncate mt-0.5">
                        {selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}
                    </h2>
                </div>
                <div>
                     <button 
                        onClick={() => {
                            localStorage.setItem('booking_seats', JSON.stringify(selectedSeats));
                            navigate('/summary');
                        }}
                        disabled={selectedSeats.length !== paxCount}
                        className="w-full sm:w-auto flex-1 sm:flex-none btn-primary px-10 py-3.5 text-base font-bold shadow-xl shadow-primary/30 rounded-xl disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        Review
                    </button>
                </div>
            </div>
        </div>
    );
}
