import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Train as TrainIcon, Wind, Wifi, BatteryCharging, Utensils, MonitorPlay, CircleOff as Toilet, CheckCircle2, RotateCcw, Briefcase } from 'lucide-react';

export default function TrainDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const api = (await import('../services/api')).default;
                const res = await api.get(`/schedules/${id}`);
                setSchedule(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if(loading) return <div className="text-center py-20 animate-in fade-in">Loading Schedule...</div>;
    if(!schedule) return <div className="text-center py-20">Schedule Not Found</div>;

    const formatTime = (dateObj) => new Date(dateObj).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-28 animate-in fade-in duration-500 min-h-screen bg-gray-50/50">
            {/* Header / Nav */}
            <div className="bg-white p-4 sticky top-0 z-50 flex items-center justify-between border-b border-border shadow-sm">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-secondary">
                        ← 
                    </button>
                    <h1 className="text-lg font-bold">Train Detail</h1>
                </div>
                <button className="text-text-secondary hover:text-primary"><HeartIcon /></button>
            </div>

            <div className="px-4 space-y-6">
                {/* Train Info Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-border mt-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">{schedule.train.name} ({schedule.train.code})</h2>
                            <p className="text-primary font-bold mt-1">{schedule.train.class} ({schedule.train.type})</p>
                        </div>
                        <div className="text-primary opacity-20"><TrainIcon size={80} /></div>
                    </div>

                    <div className="flex flex-row items-center justify-between mt-8 border-t border-border/50 pt-8 pb-4">
                        <div className="text-left w-24">
                            <h3 className="text-3xl font-black tracking-tight">{formatTime(schedule.departureTime)}</h3>
                            <p className="text-sm font-semibold text-text-secondary mt-1">{schedule.date}</p>
                            <div className="mt-3">
                                <p className="font-bold text-sm text-text-primary">{schedule.departureStation.city} ({schedule.departureStation.code})</p>
                                <p className="text-xs text-text-secondary">{schedule.departureStation.name}</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center px-4 relative my-2">
                             <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-border to-transparent absolute top-3"></div>
                             <div className="w-full flex justify-between absolute top-2 text-border">
                                 <div className="w-2 h-2 rounded-full bg-primary/20 border border-primary"></div>
                                 <div className="w-2 h-2 rounded-full bg-primary flex items-center justify-center">
                                     <div className="w-1 h-1 bg-white rounded-full"></div>
                                 </div>
                             </div>
                             <p className="text-xs font-bold tracking-wider text-text-secondary mt-4">
                                {Math.floor((new Date(schedule.arrivalTime) - new Date(schedule.departureTime)) / 60000 / 60)}h {Math.floor(((new Date(schedule.arrivalTime) - new Date(schedule.departureTime)) / 60000) % 60)}m
                             </p>
                        </div>

                        <div className="text-right w-24">
                            <h3 className="text-3xl font-black tracking-tight">{formatTime(schedule.arrivalTime)}</h3>
                            <p className="text-sm font-semibold text-text-secondary mt-1">{schedule.date}</p>
                            <div className="mt-3">
                                <p className="font-bold text-sm text-text-primary">{schedule.arrivalStation.city} ({schedule.arrivalStation.code})</p>
                                <p className="text-xs text-text-secondary">{schedule.arrivalStation.name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Facilities */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
                    <h3 className="font-bold text-lg mb-6">Facilities</h3>
                    <div className="flex justify-between p-2">
                        <FacilityItem icon={<Wind size={24} />} label="AC" />
                        <FacilityItem icon={<Wifi size={24} />} label="WiFi" />
                        <FacilityItem icon={<BatteryCharging size={24} />} label="Power Outlet" />
                        <FacilityItem icon={<Utensils size={24} />} label="Meal" />
                        <FacilityItem icon={<MonitorPlay size={24} />} label="Entertainment" />
                        <FacilityItem icon={<Toilet size={24} />} label="Toilet" />
                    </div>
                </div>

                {/* Info & Policy */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-border mb-10">
                    <h3 className="font-bold text-lg mb-6">Info</h3>
                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><CheckCircle2 size={24} /></div>
                            <div>
                                <h4 className="font-bold text-sm text-text-primary">Check-in at the station</h4>
                                <p className="text-xs text-text-secondary mt-1 max-w-sm">Minimum 30 minutes before departure</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><RotateCcw size={24} /></div>
                            <div>
                                <h4 className="font-bold text-sm text-text-primary">Refund & Reschedule</h4>
                                <p className="text-xs text-text-secondary mt-1 max-w-sm">Available according to the rules</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="p-2 bg-purple-50 text-primary rounded-lg"><Briefcase size={24} /></div>
                            <div>
                                <h4 className="font-bold text-sm text-text-primary">Baggage</h4>
                                <p className="text-xs text-text-secondary mt-1 max-w-sm">Free baggage 20 kg per passenger</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Sticky Action */}
            <div className="fixed bottom-0 w-full max-w-3xl bg-white border-t border-border shadow-[0_-10px_20px_rgba(0,0,0,0.05)] p-4 flex justify-between items-center z-50 rounded-t-3xl">
                <div>
                    <h2 className="text-2xl font-black text-text-primary">{formatPrice(schedule.price)} <span className="text-sm font-medium text-text-secondary tracking-normal">/ pax</span></h2>
                </div>
                <button 
                    onClick={() => {
                        localStorage.setItem('booking_schedule_id', schedule._id);
                        navigate(`/passenger`);
                    }}
                    className="btn-primary px-10 py-3.5 text-base font-bold shadow-lg shadow-primary/30"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

function FacilityItem({ icon, label }) {
    return (
        <div className="flex items-center flex-col space-y-3 group cursor-default">
            <div className="text-text-secondary group-hover:text-primary transition-colors">
                {icon}
            </div>
            <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary">{label}</span>
        </div>
    );
}

function HeartIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    );
}
