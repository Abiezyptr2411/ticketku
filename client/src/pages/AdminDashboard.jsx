import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Users, Train, Calendar, Ticket, CreditCard, Sidebar, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import AdminStations from '../components/admin/AdminStations';
import AdminTrains from '../components/admin/AdminTrains';
import AdminSchedules from '../components/admin/AdminSchedules';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/admin/dashboard');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);
    
    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-border p-6 flex flex-col hidden md:flex">
                <div className="font-black text-2xl text-primary tracking-tight mb-10 flex items-center space-x-2">
                    <Train size={28} />
                    <span>TicketQu</span>
                </div>
                <div className="space-y-2 flex-1">
                    <div className="font-bold text-xs text-text-secondary uppercase tracking-widest mb-4 mt-6">Overview</div>
                    <NavItem icon={<Sidebar size={20} />} label="Overview" active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
                    <NavItem icon={<Ticket size={20} />} label="Bookings" active={activeTab === 'Bookings'} onClick={() => setActiveTab('Bookings')} />
                    
                    <div className="font-bold text-xs text-text-secondary uppercase tracking-widest mb-4 mt-8">Master Data</div>
                    <NavItem icon={<Train size={20} />} label="Trains" active={activeTab === 'Trains'} onClick={() => setActiveTab('Trains')} />
                    <NavItem icon={<MapPin size={20} />} label="Stations" active={activeTab === 'Stations'} onClick={() => setActiveTab('Stations')} />
                    <NavItem icon={<Calendar size={20} />} label="Schedules" active={activeTab === 'Schedules'} onClick={() => setActiveTab('Schedules')} />
                    <NavItem icon={<Users size={20} />} label="Users" active={activeTab === 'Users'} onClick={() => setActiveTab('Users')} />
                </div>
                <div className="pt-4 border-t border-border">
                     <button onClick={() => navigate('/')} className="text-text-secondary font-medium hover:text-primary transition-colors py-2 flex items-center space-x-2 w-full text-sm">
                        <span>← Back to App</span>
                     </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto animate-in fade-in duration-500">
                <div className="p-8">
                    <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
                    
                    {activeTab === 'Overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <StatCard title="Total Bookings" value={loading ? '-' : data.stats.totalBookings} trend="+2%" />
                                <StatCard title="Revenue (IDR)" value={loading ? '-' : (data.stats.totalRevenue).toLocaleString('id-ID')} trend="+8%" />
                                <StatCard title="Active Trains" value={loading ? '-' : data.stats.activeTrains} trend="0%" />
                                <StatCard title="Registered Users" value={loading ? '-' : data.stats.registeredUsers} trend="+3%" />
                            </div>

                            {/* CHARTS LAYER */}
                            {!loading && data && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                    <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-sm">
                                        <h2 className="font-bold text-lg mb-4">Revenue & Bookings Trend (7 Days)</h2>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={data.charts.daily} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} dy={10} />
                                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} tickFormatter={(v) => (v/1000)+'k'} />
                                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                    <Line yAxisId="left" type="monotone" name="Revenue Rp" dataKey="revenue" stroke="#6C3BFF" strokeWidth={3} dot={{r:4, fill:'#6C3BFF'}} activeDot={{r: 6}} />
                                                    <Line yAxisId="right" type="monotone" name="Bookings" dataKey="bookings" stroke="#10B981" strokeWidth={3} dot={{r:4, fill:'#10B981'}} activeDot={{r: 6}} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                                        <h2 className="font-bold text-lg mb-4">Transaction Status</h2>
                                        <div className="h-64 flex flex-col justify-center items-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={data.charts.paymentStatus} dataKey="value" nameKey="_id" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                                        {data.charts.paymentStatus.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={['#6C3BFF', '#F59E0B', '#10B981', '#EF4444'][index % 4]} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="flex gap-4 mt-2">
                                                {data.charts.paymentStatus.map((entry, index) => (
                                                    <div key={index} className="flex items-center text-xs font-bold text-text-secondary">
                                                        <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: ['#6C3BFF', '#F59E0B', '#10B981', '#EF4444'][index % 4]}}></div>
                                                        {entry._id}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-bold text-lg">Recent Bookings</h2>
                                    <button className="text-primary text-sm font-semibold hover:bg-primary-light px-3 py-1.5 rounded-lg transition-colors">View All</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-text-secondary uppercase bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-4 rounded-tl-xl rounded-bl-xl font-bold tracking-wider">Booking Code</th>
                                                <th className="px-6 py-4 font-bold tracking-wider">User</th>
                                                <th className="px-6 py-4 font-bold tracking-wider">Route</th>
                                                <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                                <th className="px-6 py-4 rounded-tr-xl rounded-br-xl font-bold tracking-wider">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                                            ) : data.recentBookings.length === 0 ? (
                                                <tr><td colSpan="5" className="text-center py-8 text-text-secondary">No recent bookings</td></tr>
                                            ) : data.recentBookings.map((b) => (
                                                <tr key={b._id} className="border-b border-border/50 hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-text-primary text-[11px] font-mono">{b._id.toString().substring(18).toUpperCase()}</td>
                                                    <td className="px-6 py-4 font-medium">{b.user?.fullName}</td>
                                                    <td className="px-6 py-4 font-medium"><span className="text-gray-400">{b.schedule?.departureStation?.code} →</span> {b.schedule?.arrivalStation?.code}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md border ${
                                                            b.paymentStatus === 'PAID' ? 'text-[#00b368] bg-[#00b368]/10 border-[#00b368]/20' :
                                                            b.paymentStatus === 'PENDING' ? 'text-orange-500 bg-orange-100 border-orange-200' :
                                                            'text-red-500 bg-red-100 border-red-200'
                                                        }`}>
                                                            {b.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-text-primary">{(b.totalPrice || 0).toLocaleString('id-ID')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Trains' && <AdminTrains />}
                    {activeTab === 'Stations' && <AdminStations />}
                    {activeTab === 'Schedules' && <AdminSchedules />}
                    {(activeTab === 'Bookings' || activeTab === 'Users') && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-border">
                            <h2 className="text-xl font-bold text-text-secondary mb-2">Coming Soon</h2>
                            <p className="text-sm text-gray-400">This module is under development.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${active ? 'bg-primary text-white shadow-md shadow-primary/30 transform scale-[1.02]' : 'text-text-secondary hover:bg-gray-100/80 hover:text-text-primary'}`}>
            {icon}
            <span>{label}</span>
        </button>
    );
}

function StatCard({ title, value, trend }) {
    const isUp = trend.startsWith('+');
    return (
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-default">
            <p className="text-text-secondary text-xs uppercase tracking-widest font-bold mb-3">{title}</p>
            <div className="flex justify-between items-end">
                <h3 className="text-3xl font-black text-text-primary tracking-tight">{value}</h3>
                <span className={`text-[11px] font-bold px-2 py-1 rounded-md border ${isUp ? 'bg-green-100 text-green-600 border-green-200' : 'bg-gray-100 text-text-secondary border-gray-200'}`}>{trend}</span>
            </div>
        </div>
    );
}
