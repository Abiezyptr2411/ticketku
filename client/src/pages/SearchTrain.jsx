import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchSchedules } from '../services/railwayService';
import { MapPin, Calendar, Users, SlidersHorizontal, Train as TrainIcon, Clock } from 'lucide-react';

export default function SearchTrain() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('All');

    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const date = searchParams.get('date') || '';
    const pax = searchParams.get('pax') || '1';
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Also fetch stations to map the ID to names at the header
                const [schRes, stRes] = await Promise.all([
                    searchSchedules(from, to, date),
                    import('../services/api').then(mod => mod.default.get('/stations'))
                ]);
                setSchedules(schRes);
                setStations(stRes.data);
            } catch (err) {
                console.error('Failed to load search data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [from, to, date]);

    const displayDate = date ? new Date(date).toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    }) : 'Any Date';

    const formatTime = (dateObj) => new Date(dateObj).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    
    const fromStationName = stations.find(s => s._id === from)?.city || 'Select Station';
    const toStationName = stations.find(s => s._id === to)?.city || 'Select Station';

    return (
        <div className="max-w-5xl mx-auto p-3 sm:p-6 lg:p-8 space-y-6 bg-background animate-in fade-in duration-500">
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                     <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-secondary">
                        ←
                     </button>
                     <div>
                        <h1 className="text-lg font-bold flex items-center space-x-3 text-text-primary">
                            <span>{fromStationName}</span> 
                            <span className="text-text-secondary font-normal text-sm">→</span> 
                            <span>{toStationName}</span>
                        </h1>
                        <p className="text-sm text-text-secondary flex items-center space-x-2 mt-1">
                            <Calendar size={14} /> <span>{displayDate}</span>
                            <span className="mx-1">•</span>
                            <Users size={14} /> <span>{pax} Adult</span>
                        </p>
                     </div>
                </div>
                <button className="text-sm font-semibold text-primary bg-primary-light hover:bg-primary hover:text-white transition-colors px-5 py-2.5 rounded-xl border border-primary/20">
                    Change Search
                </button>
            </div>

            {/* Filters & Sorting */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-white rounded-xl shadow-sm border border-border p-1.5 w-full md:w-auto overflow-x-auto scrollbar-hide">
                    {['All', 'Executive', 'Business', 'Economy'].map(cls => (
                        <button 
                            key={cls}
                            onClick={() => setFilter(cls)}
                            className={`flex-none px-4 sm:px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${filter === cls ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-primary hover:bg-primary-light'}`}
                        >
                            {cls}
                        </button>
                    ))}
                </div>
                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-primary border border-border shadow-sm hover:border-primary transition-colors">
                        <span className="font-bold tracking-widest text-[#a0a0a0]">↑↓</span>
                        <span className="font-semibold">Sort</span>
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-primary border border-border shadow-sm hover:border-primary transition-colors">
                        <SlidersHorizontal size={16} />
                        <span className="font-semibold">Filter</span>
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10">Loading schedules...</div>
                ) : schedules.length > 0 ? (
                    schedules.filter(s => filter === 'All' || s.train.class === filter).map(schedule => (
                        <div key={schedule._id} className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-border hover:shadow-md hover:border-primary/40 transition-all w-full flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden group">
                            
                            <div className="flex-1 flex flex-col justify-center relative z-10 w-full">
                                <div className="flex items-center space-x-3 sm:space-x-4 mb-5">
                                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#E2D4FF] to-primary-light text-primary rounded-2xl shadow-inner border border-white">
                                        <TrainIcon size={28} className="sm:w-8 sm:h-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base sm:text-lg text-text-primary capitalize tracking-tight">{schedule.train.name} <span className="text-text-secondary font-normal text-xs sm:text-sm ml-1">({schedule.train.code})</span></h3>
                                        <p className="text-[11px] sm:text-xs font-bold text-primary mt-0.5">{schedule.train.class} {schedule.train.type && <span className="font-medium">({schedule.train.type})</span>}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 relative">
                                    <div className="text-center shrink-0 w-16 sm:w-24">
                                        <p className="text-xl sm:text-2xl font-black tracking-tight">{formatTime(schedule.departureTime)}</p>
                                        <p className="text-[10px] sm:text-xs font-medium text-text-secondary mt-1 tracking-wide">{schedule.departureStation.city} ({schedule.departureStation.code})</p>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center px-1 sm:px-4 relative my-2 min-w-[50px]">
                                        <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-border to-transparent absolute top-3"></div>
                                        <div className="w-full flex justify-between absolute top-2 text-border">
                                            <div className="hidden sm:block w-2 h-2 rounded-full bg-primary/20 border border-primary"></div>
                                            <div className="hidden sm:flex w-2 h-2 rounded-full bg-primary items-center justify-center">
                                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] sm:text-[11px] font-bold tracking-wider text-text-secondary bg-white px-2 sm:px-3 relative z-10 rounded-full border border-border shadow-sm flex items-center py-0.5">
                                            <span>{Math.floor((new Date(schedule.arrivalTime) - new Date(schedule.departureTime)) / 60000 / 60)}h {Math.floor(((new Date(schedule.arrivalTime) - new Date(schedule.departureTime)) / 60000) % 60)}m</span>
                                        </p>
                                    </div>
                                    <div className="text-center shrink-0 w-16 sm:w-24">
                                        <p className="text-xl sm:text-2xl font-black tracking-tight">{formatTime(schedule.arrivalTime)}</p>
                                        <p className="text-[10px] sm:text-xs font-medium text-text-secondary mt-1 tracking-wide">{schedule.arrivalStation.city} ({schedule.arrivalStation.code})</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="md:w-56 flex flex-col justify-end items-end border-t md:border-t-0 md:border-l border-border/70 pt-5 md:pt-0 pl-0 md:pl-6 relative z-10 w-full">
                                <div className="text-right w-full flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end">
                                    <div>
                                        <h2 className="text-2xl font-black text-text-primary tracking-tight">{formatPrice(schedule.price)} <span className="text-xs font-medium text-text-secondary tracking-normal">/ pax</span></h2>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#00b368] mt-1 bg-[#00b368]/10 inline-block px-2 py-0.5 rounded-full">{schedule.train.class}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        localStorage.setItem('booking_pax', pax);
                                        navigate(`/train/${schedule._id}`);
                                    }}
                                    className="w-full mt-5 px-6 py-3 rounded-xl font-bold text-[13px] uppercase tracking-wider text-primary border border-primary/30 hover:bg-primary hover:text-white transition-all shadow-sm group-hover:shadow-[0_0_20px_rgba(108,59,255,0.2)]"
                                >
                                    See Details
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-border">
                        <div className="text-gray-300 flex justify-center mb-4"><TrainIcon size={48} /></div>
                        <h3 className="text-xl font-bold text-text-primary">No trains found</h3>
                        <p className="text-text-secondary mt-2">Try changing your search date or stations.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
