import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminTrains() {
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', class: 'Executive', capacity: 50 });

    useEffect(() => { fetchTrains(); }, []);

    const fetchTrains = async () => {
        try {
            const { data } = await api.get('/trains');
            setTrains(data);
            setLoading(false);
        } catch (error) { console.error('Failed to fetch trains', error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/trains', formData);
            setIsFormOpen(false);
            setFormData({ name: '', code: '', class: 'Executive', capacity: 50 });
            fetchTrains();
        } catch (error) { console.error('Failed to create train', error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this train?')) return;
        try {
            await api.delete(`/trains/${id}`);
            fetchTrains();
        } catch (error) { console.error('Delete failed', error); }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg">Manage Trains</h2>
                <button onClick={() => setIsFormOpen(!isFormOpen)} className="btn-primary flex items-center space-x-2 px-4 py-2 text-sm rounded-xl">
                    <Plus size={16} /> <span>New Train</span>
                </button>
            </div>

            {isFormOpen && (
                <form onSubmit={handleSubmit} className="mb-8 bg-gray-50/50 p-6 rounded-2xl border border-border flex flex-col gap-4">
                    <h3 className="font-bold text-sm tracking-widest text-text-secondary uppercase mb-2">Create Train</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input className="input-field bg-white" placeholder="Train Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <input className="input-field bg-white" placeholder="Train Code (e.g. 6)" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
                        <select className="input-field bg-white appearance-none" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} required>
                            <option value="Executive">Executive</option>
                            <option value="Business">Business</option>
                            <option value="Economy">Economy</option>
                        </select>
                        <input type="number" className="input-field bg-white" placeholder="Capacity (e.g. 50)" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} required />
                    </div>
                    <div className="flex justify-end gap-3 mt-2">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-xl text-text-secondary font-bold text-sm hover:bg-gray-100 transition">Cancel</button>
                        <button type="submit" className="btn-primary px-6 py-2 rounded-xl text-sm font-bold shadow-md shadow-primary/20">Save Train</button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-text-secondary uppercase bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-xl font-bold tracking-wider">Train Name</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Code</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Class</th>
                            <th className="px-6 py-4 rounded-tr-xl font-bold tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>}
                        {!loading && trains.map(item => (
                            <tr key={item._id} className="border-b border-border/50 hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold">{item.name}</td>
                                <td className="px-6 py-4 font-bold text-primary">{item.code}</td>
                                <td className="px-6 py-4 font-medium text-text-secondary">{item.class} (Cap: {item.capacity})</td>
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
