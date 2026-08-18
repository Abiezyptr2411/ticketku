import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminSchedules() {
    const [schedules, setSchedules] = useState([]);
    const [trains, setTrains] = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        train: '', departureStation: '', arrivalStation: '',
        departureTime: '', arrivalTime: '', duration: '', price: '', status: 'Available'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [schRes, trRes, stRes] = await Promise.all([
                api.get('/schedules'),
                api.get('/trains'),
                api.get('/stations')
            ]);
            setSchedules(schRes.data);
            setTrains(trRes.data);
            setStations(stRes.data);
            setLoading(false);
        } catch (error) { console.error('Fetch failed', error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/schedules', formData);
            setIsFormOpen(false);
            setFormData({ train: '', departureStation: '', arrivalStation: '', departureTime: '', arrivalTime: '', duration: '', price: '', status: 'Available' });
            fetchData();
        } catch (error) { console.error('Creation failed', error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this schedule?')) return;
        try {
            await api.delete(`/schedules/${id}`);
            fetchData();
        } catch (error) { console.error('Delete failed', error); }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg">Manage Schedules</h2>
                <button onClick={() => setIsFormOpen(!isFormOpen)} className="btn-primary flex items-center space-x-2 px-4 py-2 text-sm rounded-xl">
                    <Plus size={16} /> <span>New Schedule</span>
                </button>
            </div>

            {isFormOpen && (
                <form onSubmit={handleSubmit} className="mb-8 bg-gray-50/50 p-6 rounded-2xl border border-border flex flex-col gap-4">
                    <h3 className="font-bold text-sm tracking-widest text-text-secondary uppercase mb-2">Create Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <select className="input-field bg-white" value={formData.train} onChange={e => setFormData({...formData, train: e.target.value})} required>
                            <option value="">Select Train...</option>
                            {trains.map(t => <option key={t._id} value={t._id}>{t.name} ({t.class})</option>)}
                        </select>
                        <select className="input-field bg-white" value={formData.departureStation} onChange={e => setFormData({...formData, departureStation: e.target.value})} required>
                            <option value="">Dep Station...</option>
                            {stations.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                        </select>
                        <select className="input-field bg-white" value={formData.arrivalStation} onChange={e => setFormData({...formData, arrivalStation: e.target.value})} required>
                            <option value="">Arr Station...</option>
                            {stations.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                        </select>
                        <div>
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Dep Time</label>
                            <input type="datetime-local" className="input-field bg-white" value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Arr Time</label>
                            <input type="datetime-local" className="input-field bg-white" value={formData.arrivalTime} onChange={e => setFormData({...formData, arrivalTime: e.target.value})} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Duration & Price</label>
                            <div className="flex gap-2">
                                <input type="text" className="input-field bg-white flex-1" placeholder="Dur (e.g. 6h 30m)" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required />
                                <input type="number" className="input-field bg-white flex-1" placeholder="IDR Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-2">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-xl text-text-secondary font-bold text-sm hover:bg-gray-100 transition">Cancel</button>
                        <button type="submit" className="btn-primary px-6 py-2 rounded-xl text-sm font-bold shadow-md shadow-primary/20">Save Schedule</button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-text-secondary uppercase bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-xl font-bold tracking-wider">Train</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Route</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Timing</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Price (IDR)</th>
                            <th className="px-6 py-4 rounded-tr-xl font-bold tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>}
                        {!loading && schedules.map(item => (
                            <tr key={item._id} className="border-b border-border/50 hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-primary">{item.train?.name || 'Unknown'}</td>
                                <td className="px-6 py-4 font-medium"><span className="text-gray-400">{item.departureStation?.code} →</span> {item.arrivalStation?.code}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold">{new Date(item.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(item.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    <div className="text-[10px] text-text-secondary font-bold uppercase">{new Date(item.departureTime).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 font-bold">{(item.price || 0).toLocaleString('id-ID')}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
