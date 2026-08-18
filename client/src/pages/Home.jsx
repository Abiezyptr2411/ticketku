import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Bell, User, Train, ScanLine, Wallet, Clock, MapPin, Search } from 'lucide-react';
import api from '../services/api';

export default function Home() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [stations, setStations] = useState([]);
    const [liveSchedule, setLiveSchedule] = useState(null);
    const [searchForm, setSearchForm] = useState({
        from: '',
        to: '',
        date: '',
        passenger: 1
    });

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const st = await api.get('/stations');
                setStations(st.data);
                
                const sch = await api.get('/schedules');
                if (sch.data && sch.data.length > 0) {
                    setLiveSchedule(sch.data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch home data', error);
            }
        };
        fetchHomeData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?from=${searchForm.from}&to=${searchForm.to}&date=${searchForm.date}&pax=${searchForm.passenger}`);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center bg-card p-4 rounded-2xl shadow-sm border border-border">
                <div className="flex items-center space-x-3">
                   <div className="bg-primary text-white p-2 rounded-xl"><Train size={24} /></div>
                   <div>
                    <h1 className="text-sm font-medium text-text-secondary">Good evening,</h1>
                    <p className="text-primary-dark font-bold text-lg">{user?.fullName || 'Guest'}</p>
                   </div>
                </div>
                <div className="flex items-center space-x-4 text-text-secondary relative">
                    <button onClick={() => navigate('/my-tickets')} className="p-2 hover:bg-primary-light rounded-full hover:text-primary transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <div 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="h-10 w-10 bg-primary-light rounded-full flex items-center justify-center text-primary font-bold shadow-sm border-2 border-white cursor-pointer hover:scale-105 transition-transform"
                    >
                        {user?.fullName?.charAt(0) || <User size={20} />}
                    </div>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-4 py-3 border-b border-border/50 mb-1">
                                <p className="text-sm font-bold truncate">{user?.fullName}</p>
                                <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                            </div>
                            <button onClick={() => { setIsMenuOpen(false); navigate('/my-tickets'); }} className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-primary-light hover:text-primary transition-colors flex items-center space-x-3">
                                <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary"><Train size={12} /></span>
                                <span>My Tickets</span>
                            </button>
                            <button onClick={() => { setIsMenuOpen(false); navigate('/profile'); }} className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-primary-light hover:text-primary transition-colors flex items-center space-x-3">
                                <span className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-blue-500"><User size={12} /></span>
                                <span>Edit Profile</span>
                            </button>
                            <button onClick={() => { setIsMenuOpen(false); logout(); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-red-50 text-red-600 transition-colors flex items-center space-x-3 mt-1 border-t border-border/50">
                                <span className="w-5 h-5 rounded bg-red-500/20 flex items-center justify-center text-red-600">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                </span>
                                <span>Log Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Wallet & Search */}
                <div className="lg:col-span-8 space-y-6">
                    {/* RailwayPay Card */}
                    <div className="bg-gradient-to-br from-primary to-[#4B1FD1] rounded-3xl p-8 text-white shadow-lg shadow-primary/30 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none transform rotate-12">
                            <Train size={300} />
                        </div>
                        <div className="relative z-10 flex justify-between items-start mb-10">
                            <div>
                                <p className="text-primary-light tracking-wide text-sm font-medium mb-1">RailwayPay Balance</p>
                                <h3 className="text-4xl font-bold">{(user?.walletBalance ?? 250000).toLocaleString('id-ID')}</h3>
                            </div>
                            <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                <span>{user?.points ?? 230} points</span>
                            </div>
                        </div>
                        <div className="relative z-10 flex space-x-8">
                            <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan')} className="flex flex-col items-center space-y-2 text-sm hover:text-primary-light transition-colors group">
                                <div className="p-3 bg-white/10 group-hover:bg-white/20 rounded-2xl backdrop-blur-md transition-colors"><ScanLine size={24} /></div>
                                <span className="font-medium">Scan</span>
                            </button>
                            <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan')} className="flex flex-col items-center space-y-2 text-sm hover:text-primary-light transition-colors group">
                                <div className="p-3 bg-white/10 group-hover:bg-white/20 rounded-2xl backdrop-blur-md transition-colors"><Wallet size={24} /></div>
                                <span className="font-medium">Top Up</span>
                            </button>
                            <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan')} className="flex flex-col items-center space-y-2 text-sm hover:text-primary-light transition-colors group">
                                <div className="p-3 bg-white/10 group-hover:bg-white/20 rounded-2xl backdrop-blur-md transition-colors"><Clock size={24} /></div>
                                <span className="font-medium">History</span>
                            </button>
                        </div>
                    </div>

                    {/* Search Ticket Card */}
                    <div className="card border-0 shadow-lg relative z-20 -mt-6 mx-4">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            <h2 className="text-xl font-bold">Search Ticket</h2>
                        </div>
                        
                        <form onSubmit={handleSearch} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">From</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3 top-3 text-primary/50 group-focus-within:text-primary transition-colors" size={20} />
                                        <select 
                                            className="input-field pl-11 bg-gray-50/50"
                                            value={searchForm.from}
                                            onChange={e => setSearchForm({...searchForm, from: e.target.value})}
                                            required
                                        >
                                            <option value="">Select departure</option>
                                            {stations.map(st => (
                                                <option key={st._id} value={st._id}>{st.city} ({st.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center p-2 bg-white rounded-full border border-border shadow-sm text-primary hover:bg-primary-light cursor-pointer transition-colors mt-3">
                                   <div className="rotate-90 sm:rotate-0">⇄</div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">To</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3 top-3 text-primary/50 group-focus-within:text-primary transition-colors" size={20} />
                                        <select 
                                            className="input-field pl-11 bg-gray-50/50"
                                            value={searchForm.to}
                                            onChange={e => setSearchForm({...searchForm, to: e.target.value})}
                                            required
                                        >
                                            <option value="">Select destination</option>
                                            {stations.map(st => (
                                                <option key={st._id} value={st._id}>{st.city} ({st.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Departure Date</label>
                                    <input 
                                        type="date" 
                                        className="input-field bg-gray-50/50"
                                        value={searchForm.date}
                                        onChange={e => setSearchForm({...searchForm, date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Passenger</label>
                                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                        <div className="flex-1 flex items-center border border-border rounded-lg bg-gray-50/50 px-3 py-1 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                                            <input 
                                                type="number" 
                                                min="1" max="4"
                                                className="w-full bg-transparent focus:outline-none text-center font-medium"
                                                value={searchForm.passenger}
                                                onChange={e => setSearchForm({...searchForm, passenger: e.target.value})}
                                                required
                                            />
                                            <span className="text-text-secondary text-sm pr-2">Adult</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" className="w-full btn-primary py-4 flex justify-center items-center space-x-2 font-bold text-base mt-4 shadow-lg shadow-primary/20">
                                <Search size={20} />
                                <span>Search Train</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Quick Menu & Promo */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Quick Menu */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-bold">Quick Menu</h2>
                            <button className="text-primary text-sm font-semibold hover:underline">See All</button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { name: 'Intercity', icon: <Train size={24} />, bg: 'bg-primary-light', text: 'text-primary' },
                                { name: 'Local', icon: <Train size={24} />, bg: 'bg-blue-50', text: 'text-blue-500' },
                                { name: 'Commuter', icon: <Train size={24} />, bg: 'bg-green-50', text: 'text-green-500' },
                                { name: 'Airport', icon: <Train size={24} />, bg: 'bg-orange-50', text: 'text-orange-500' }
                            ].map((menu, i) => (
                                <div key={i} onClick={() => navigate('/search')} className="flex flex-col items-center space-y-2 cursor-pointer group">
                                    <div className={`p-3 ${menu.bg} rounded-2xl group-hover:scale-105 transition-transform ${menu.text} shadow-sm`}>
                                        {menu.icon}
                                    </div>
                                    <span className="text-xs font-semibold text-text-secondary text-center">{menu.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Promo Banner */}
                    <div className="bg-gradient-to-r from-[#4B1FD1] to-primary p-6 rounded-3xl text-white shadow-lg cursor-pointer hover:scale-[1.02] transition-transform overflow-hidden relative">
                         <div className="absolute -right-4 -bottom-4 opacity-20">
                            <Train size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm text-xs font-bold rounded mb-3 border border-white/30">SPECIAL PROMO</div>
                            <h3 className="font-bold text-2xl tracking-tight leading-tight">Discount up to 30%</h3>
                            <p className="text-sm text-white/80 mt-2 mb-5">For intercity train travels this month.</p>
                            <button onClick={() => navigate('/search')} className="text-sm border flex items-center space-x-1 font-bold text-primary bg-white px-5 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                                <span>Book Now</span>
                            </button>
                        </div>
                    </div>

                     {/* Live Tracking */}
                     <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Live Tracking</h2>
                            <span className="text-sm text-primary font-medium cursor-pointer">View All</span>
                        </div>
                        {liveSchedule ? (
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer rounded-2xl border border-border">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-border/50"><Train size={22} className="text-primary" /></div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-text-primary text-sm">{liveSchedule.train?.name} ({liveSchedule.train?.code})</h4>
                                    <div className="flex items-center space-x-1.5 mt-1 text-xs text-text-secondary">
                                        <span>{liveSchedule.departureStation?.city}</span>
                                        <span>→</span>
                                        <span>{liveSchedule.arrivalStation?.city}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1.5 rounded-lg border border-green-200">On Time</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-text-secondary text-center py-4">No active trains at the moment</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
