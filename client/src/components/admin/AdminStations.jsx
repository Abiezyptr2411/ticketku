import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function AdminStations() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', city: '', code: '' });

    useEffect(() => { fetchStations(); }, []);

    const fetchStations = async () => {
        try {
            const { data } = await api.get('/stations');
            setStations(data);
            setLoading(false);
        } catch (error) { console.error('Failed to fetch stations', error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/stations', formData);
            setIsFormOpen(false);
            setFormData({ name: '', city: '', code: '' });
            fetchStations();
        } catch (error) { console.error('Failed to create station', error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this station?')) return;
        try {
            await api.delete(`/stations/${id}`);
            fetchStations();
        } catch (error) { console.error('Delete failed', error); }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg">Manage Stations</h2>
                <button onClick={() => setIsFormOpen(!isFormOpen)} className="btn-primary flex items-center space-x-2 px-4 py-2 text-sm rounded-xl">
                    <Plus size={16} /> <span>New Station</span>
                </button>
            </div>

            {isFormOpen && (
                <form onSubmit={handleSubmit} className="mb-8 bg-gray-50/50 p-6 rounded-2xl border border-border flex flex-col gap-4">
                    <h3 className="font-bold text-sm tracking-widest text-text-secondary uppercase mb-2">Create Station</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input className="input-field bg-white" placeholder="Station Name (e.g. Gambir)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <input className="input-field bg-white" placeholder="City (e.g. Jakarta)" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                        <input className="input-field bg-white" placeholder="Code (e.g. GMR)" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
                    </div>
                    <div className="flex justify-end gap-3 mt-2">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-xl text-text-secondary font-bold text-sm hover:bg-gray-100 transition">Cancel</button>
                        <button type="submit" className="btn-primary px-6 py-2 rounded-xl text-sm font-bold shadow-md shadow-primary/20">Save Station</button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-text-secondary uppercase bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-xl font-bold tracking-wider">Name</th>
                            <th className="px-6 py-4 font-bold tracking-wider">City</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Code</th>
                            <th className="px-6 py-4 rounded-tr-xl font-bold tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>}
                        {!loading && stations.map(item => (
                            <tr key={item._id} className="border-b border-border/50 hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold">{item.name}</td>
                                <td className="px-6 py-4 font-medium text-text-secondary">{item.city}</td>
                                <td className="px-6 py-4 font-bold text-primary">{item.code}</td>
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
