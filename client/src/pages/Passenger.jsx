import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { User, Phone, Mail, CreditCard, CalendarDays, Users } from 'lucide-react';

export default function Passenger() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const scheduleId = localStorage.getItem('booking_schedule_id');
    const [schedule, setSchedule] = useState(null);
    
    useEffect(() => {
        const loadSchedule = async () => {
            try {
                const api = (await import('../services/api')).default;
                const res = await api.get(`/schedules/${scheduleId}`);
                setSchedule(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        if(scheduleId) loadSchedule();
    }, [scheduleId]);
    
    const savedPax = localStorage.getItem('booking_pax') || 1;
    const paxCount = parseInt(savedPax, 10);
    
    const [purchaser, setPurchaser] = useState({
        fullName: user?.fullName || 'John Doe',
        email: user?.email || 'john@example.com',
        phoneNumber: user?.phoneNumber || '08123456789'
    });

    const [passengers, setPassengers] = useState(
        Array(paxCount).fill({ fullName: '', idNumber: '', dob: '', gender: '' })
    );

    const handleAutofill = (index) => {
        handlePassengerChange(index, 'fullName', purchaser.fullName);
    };

    const handlePassengerChange = (index, field, value) => {
        const newPassengers = [...passengers];
        newPassengers[index] = { ...newPassengers[index], [field]: value };
        setPassengers(newPassengers);
    };

    const handleContinue = (e) => {
        e.preventDefault();
        localStorage.setItem('booking_passengers', JSON.stringify(passengers));
        navigate('/seat');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-28 animate-in fade-in duration-500 min-h-screen bg-gray-50/50 relative">
            {/* Header / Nav */}
            <div className="bg-white p-4 sticky top-0 z-50 flex items-center justify-between border-b border-border shadow-sm">
                <div className="flex items-center space-x-4">
                    <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-secondary">
                        ← 
                    </button>
                    <h1 className="text-lg font-bold">Passenger Info</h1>
                </div>
            </div>

            <form onSubmit={handleContinue} className="px-4 space-y-6">
                
                {/* Purchaser Info */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
                    <div className="flex items-center space-x-3 border-b border-border/50 pb-4 mb-5">
                        <div className="bg-primary-light text-primary p-2.5 rounded-xl"><User size={20} /></div>
                        <h2 className="text-lg font-bold text-text-primary">Purchaser Info</h2>
                    </div>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
                            <input 
                                type="text"
                                className="input-field bg-gray-50/50"
                                value={purchaser.fullName}
                                onChange={e => setPurchaser({...purchaser, fullName: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input 
                                        type="tel"
                                        className="input-field pl-10 bg-gray-50/50"
                                        value={purchaser.phoneNumber}
                                        onChange={e => setPurchaser({...purchaser, phoneNumber: e.target.value})}
                                        required 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input 
                                        type="email"
                                        className="input-field pl-10 bg-gray-50/50"
                                        value={purchaser.email}
                                        onChange={e => setPurchaser({...purchaser, email: e.target.value})}
                                        required 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Passenger Loop */}
                {passengers.map((pax, i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-400 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                        <div className="flex justify-between items-center border-b border-border/50 pb-4 mb-5">
                            <div className="flex items-center space-x-3">
                                <div className="bg-orange-50 text-orange-500 p-2.5 rounded-xl"><Users size={20} /></div>
                                <h2 className="text-lg font-bold text-text-primary">Passenger {i + 1}</h2>
                            </div>
                            <div className="flex items-center space-x-3">
                                {i === 0 && (
                                    <button type="button" onClick={() => handleAutofill(i)} className="text-xs font-bold text-primary hover:text-primary-dark cursor-pointer border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary-light transition-colors">
                                        Use Purchaser Info
                                    </button>
                                )}
                                <span className="text-xs font-bold tracking-wide uppercase text-text-secondary bg-gray-100 px-3 py-1.5 rounded-full border border-border">Adult</span>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
                                <input 
                                    type="text"
                                    placeholder="As per Identity Card"
                                    className="input-field bg-gray-50/50"
                                    value={pax.fullName}
                                    onChange={e => handlePassengerChange(i, 'fullName', e.target.value)}
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">ID Number (NIK / Passport)</label>
                                <div className="relative group/input">
                                    <CreditCard className="absolute left-3 top-3.5 text-gray-400 group-focus-within/input:text-primary transition-colors" size={18} />
                                    <input 
                                        type="text"
                                        className="input-field pl-10 bg-gray-50/50"
                                        value={pax.idNumber}
                                        onChange={e => handlePassengerChange(i, 'idNumber', e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Date of Birth</label>
                                    <div className="relative group/input">
                                        <CalendarDays className="absolute left-3 top-3.5 text-gray-400 group-focus-within/input:text-primary transition-colors" size={18} />
                                        <input 
                                            type="date"
                                            className="input-field pl-10 bg-gray-50/50"
                                            value={pax.dob}
                                            onChange={e => handlePassengerChange(i, 'dob', e.target.value)}
                                            required 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Gender</label>
                                    <select 
                                        className="input-field bg-gray-50/50 appearance-none font-medium text-text-secondary"
                                        value={pax.gender}
                                        onChange={e => handlePassengerChange(i, 'gender', e.target.value)}
                                        required
                                    >
                                        <option value="">Select gender...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Bottom Sticky Action */}
                <div className="fixed bottom-0 left-0 right-0 max-w-3xl mx-auto bg-white border-t border-border shadow-[0_-10px_20px_rgba(0,0,0,0.05)] px-4 py-4 sm:px-6 flex justify-between items-center z-50 rounded-t-[2rem]">
                    <div className="hidden sm:block">
                        <p className="text-xs text-text-secondary font-medium tracking-wide uppercase">Total Price</p>
                        <h2 className="text-2xl font-black text-primary tracking-tight mt-0.5">Rp {new Intl.NumberFormat('id-ID').format((schedule?.price || 0) * paxCount)}</h2>
                    </div>
                    <button 
                        type="submit"
                        className="w-full sm:w-auto flex-1 sm:flex-none btn-primary px-10 py-4 text-[15px] font-bold shadow-xl shadow-primary/30 rounded-xl"
                    >
                        Select Seat
                    </button>
                </div>
            </form>
        </div>
    );
}
