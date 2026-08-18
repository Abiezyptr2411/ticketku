import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import api from '../services/api';
import { User, Phone, CheckCircle, ArrowLeft } from 'lucide-react';

export default function EditProfile() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
        password: '' // Optional password change
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccess(false);

        try {
            await api.put('/auth/profile', form);
            await refreshUser();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-primary pt-12 pb-24 px-4 text-white rounded-b-[2.5rem] shadow-sm relative">
                <button onClick={() => navigate('/')} className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all focus:outline-none">
                    <ArrowLeft size={20} />
                </button>
                <div className="max-w-md mx-auto text-center mt-6">
                    <h1 className="text-3xl font-black tracking-tight mb-2">Edit Profile</h1>
                    <p className="text-white/80 text-sm font-medium">Update your personal information</p>
                </div>
            </div>

            <div className="max-w-md mx-auto -mt-16 px-4 pb-12 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-border">
                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 text-sm font-semibold flex items-center justify-center space-x-2 border border-green-200">
                            <CheckCircle size={18} />
                            <span>Profile updated successfully!</span>
                        </div>
                    )}
                    {errorMsg && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold text-center border border-red-100">
                            {errorMsg}
                        </div>
                    )}
                    
                    <div className="flex justify-center mb-8">
                        <div className="h-24 w-24 bg-primary-light rounded-full flex items-center justify-center text-primary font-black text-4xl shadow-md border-4 border-white">
                            {user?.fullName?.charAt(0) || 'A'}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-text-secondary pl-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50 group-focus-within:text-primary transition-colors" size={20} />
                                <input 
                                    type="text" 
                                    name="fullName"
                                    className="input-field pl-12 h-14 bg-gray-50/50"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-text-secondary pl-1">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50 group-focus-within:text-primary transition-colors" size={20} />
                                <input 
                                    type="tel" 
                                    name="phoneNumber"
                                    className="input-field pl-12 h-14 bg-gray-50/50"
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-sm font-semibold text-text-secondary pl-1">New Password (Optional)</label>
                            <div className="relative group">
                                <input 
                                    type="password" 
                                    name="password"
                                    placeholder="Leave blank to keep unchanged"
                                    className="input-field px-4 h-14 bg-gray-50/50 text-sm"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-4 rounded-xl text-base font-bold text-white shadow-lg shadow-primary/30 mt-8 transition-all ${loading ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark hover:scale-[1.02]'}`}
                        >
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
