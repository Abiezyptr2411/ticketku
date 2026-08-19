import { useState, useEffect, useCallback } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Eye, RefreshCw, CheckCircle, Trash2, AlertTriangle, UserCog, Shield, User } from 'lucide-react';
import api from '../../services/api';

const ROLE_CONFIG = {
    ADMIN: { label: 'ADMIN', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Shield },
    USER:  { label: 'USER',  color: 'text-blue-500 bg-blue-50 border-blue-200', icon: User },
};

function RoleBadge({ role }) {
    const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.USER;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md border ${cfg.color}`}>
            <Icon size={11} />
            {cfg.label}
        </span>
    );
}

function formatDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatIDR(n) {
    return 'Rp ' + (n || 0).toLocaleString('id-ID');
}

const ROLES = ['ALL', 'USER', 'ADMIN'];

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selected, setSelected] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [updateMsg, setUpdateMsg] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({});
    const LIMIT = 10;

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: LIMIT });
            if (roleFilter !== 'ALL') params.append('role', roleFilter);
            if (search) params.append('search', search);
            const res = await api.get(`/admin/users?${params.toString()}`);
            setUsers(res.data.users);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, roleFilter, search]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleRoleFilter = (r) => { setRoleFilter(r); setPage(1); };
    const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };
    const clearSearch = () => { setSearchInput(''); setSearch(''); setPage(1); };

    const openDetail = (u) => {
        setSelected(u);
        setEditForm({
            fullName: u.fullName,
            phoneNumber: u.phoneNumber,
            role: u.role,
            walletBalance: u.walletBalance,
            points: u.points,
        });
        setUpdateMsg('');
    };

    const handleUpdate = async () => {
        if (!selected) return;
        setUpdating(true);
        setUpdateMsg('');
        try {
            await api.patch(`/admin/users/${selected._id}`, {
                fullName: editForm.fullName,
                phoneNumber: editForm.phoneNumber,
                role: editForm.role,
                walletBalance: Number(editForm.walletBalance),
                points: Number(editForm.points),
            });
            setUpdateMsg('✓ User berhasil diperbarui');
            fetchUsers();
            setSelected(prev => ({ ...prev, ...editForm }));
        } catch (err) {
            setUpdateMsg('✗ Gagal memperbarui user');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            await api.delete(`/admin/users/${deleteConfirm._id}`);
            setDeleteConfirm(null);
            setSelected(null);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menghapus user');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-text-primary">User Management</h2>
                    <p className="text-sm text-text-secondary mt-0.5">{total} user terdaftar</p>
                </div>
                <button onClick={fetchUsers} className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-gray-100 transition-colors text-sm font-medium self-start md:self-auto">
                    <RefreshCw size={15} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-border p-4 mb-4 flex flex-col md:flex-row gap-3">
                <div className="flex gap-1.5">
                    {ROLES.map(r => (
                        <button key={r} onClick={() => handleRoleFilter(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                roleFilter === r
                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                    : 'text-text-secondary border-border hover:border-primary/40 hover:text-primary'
                            }`}>
                            {r}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSearch} className="flex gap-2 ml-auto w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                            placeholder="Cari nama / email / telepon..."
                            className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                        {searchInput && (
                            <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">Cari</button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-text-secondary uppercase bg-gray-50/70 border-b border-border">
                            <tr>
                                <th className="px-5 py-4 font-bold tracking-wider">User</th>
                                <th className="px-5 py-4 font-bold tracking-wider">No. Telepon</th>
                                <th className="px-5 py-4 font-bold tracking-wider">Role</th>
                                <th className="px-5 py-4 font-bold tracking-wider">Wallet</th>
                                <th className="px-5 py-4 font-bold tracking-wider">Points</th>
                                <th className="px-5 py-4 font-bold tracking-wider">Bergabung</th>
                                <th className="px-5 py-4 font-bold tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-16 text-text-secondary">
                                    <div className="flex flex-col items-center gap-2">
                                        <RefreshCw size={22} className="animate-spin text-primary/60" />
                                        <span className="text-sm">Memuat data...</span>
                                    </div>
                                </td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-16 text-text-secondary">
                                    <div className="flex flex-col items-center gap-2">
                                        <UserCog size={32} className="text-gray-300" />
                                        <span className="font-medium text-sm">Tidak ada user ditemukan</span>
                                    </div>
                                </td></tr>
                            ) : users.map((u) => (
                                <tr key={u._id} className="border-b border-border/40 hover:bg-gray-50/70 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 ${u.role === 'ADMIN' ? 'bg-purple-500' : 'bg-primary'}`}>
                                                {u.fullName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-text-primary leading-tight">{u.fullName}</p>
                                                <p className="text-xs text-text-secondary">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-text-secondary font-medium">{u.phoneNumber || '-'}</td>
                                    <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                                    <td className="px-5 py-4 font-semibold text-sm text-text-primary">{formatIDR(u.walletBalance)}</td>
                                    <td className="px-5 py-4">
                                        <span className="font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md text-xs">
                                            ⭐ {(u.points || 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-text-secondary">{formatDate(u.createdAt)}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => openDetail(u)}
                                                className="p-2 rounded-lg bg-primary/5 text-primary hover:bg-primary/15 transition-colors" title="Edit">
                                                <Eye size={15} />
                                            </button>
                                            {u.role !== 'ADMIN' && (
                                                <button onClick={() => setDeleteConfirm(u)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Hapus">
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-gray-50/50">
                        <p className="text-xs text-text-secondary">
                            Halaman <span className="font-bold">{page}</span> dari <span className="font-bold">{totalPages}</span> · {total} user
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-white transition-colors">
                                <ChevronLeft size={15} />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pg;
                                if (totalPages <= 5) pg = i + 1;
                                else if (page <= 3) pg = i + 1;
                                else if (page >= totalPages - 2) pg = totalPages - 4 + i;
                                else pg = page - 2 + i;
                                return (
                                    <button key={pg} onClick={() => setPage(pg)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${pg === page ? 'bg-primary text-white border-primary' : 'border-border hover:bg-white'}`}>
                                        {pg}
                                    </button>
                                );
                            })}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-white transition-colors">
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black ${selected.role === 'ADMIN' ? 'bg-purple-500' : 'bg-primary'}`}>
                                    {selected.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-text-primary leading-tight">{selected.fullName}</h3>
                                    <p className="text-xs text-text-secondary">{selected.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Info readonly */}
                            <div className="bg-gray-50/70 rounded-2xl border border-border/60 p-4">
                                <p className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3">Info Akun</p>
                                <div className="flex justify-between text-sm py-1.5 border-b border-border/30">
                                    <span className="text-text-secondary font-medium">Email</span>
                                    <span className="font-semibold text-text-primary">{selected.email}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1.5">
                                    <span className="text-text-secondary font-medium">Bergabung</span>
                                    <span className="font-semibold text-text-primary">{formatDate(selected.createdAt)}</span>
                                </div>
                            </div>

                            {/* Editable Fields */}
                            <div className="bg-gray-50/70 rounded-2xl border border-border/60 p-4 space-y-4">
                                <p className="text-xs font-black text-text-secondary uppercase tracking-widest">Edit Data User</p>

                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Nama Lengkap</label>
                                    <input type="text" value={editForm.fullName || ''} onChange={e => setEditForm(f => ({...f, fullName: e.target.value}))}
                                        className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-1.5">No. Telepon</label>
                                    <input type="text" value={editForm.phoneNumber || ''} onChange={e => setEditForm(f => ({...f, phoneNumber: e.target.value}))}
                                        className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Role</label>
                                    <select value={editForm.role || 'USER'} onChange={e => setEditForm(f => ({...f, role: e.target.value}))}
                                        className="w-full border border-border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary mb-1.5">Wallet Balance (Rp)</label>
                                        <input type="number" value={editForm.walletBalance ?? ''} onChange={e => setEditForm(f => ({...f, walletBalance: e.target.value}))}
                                            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary mb-1.5">Points ⭐</label>
                                        <input type="number" value={editForm.points ?? ''} onChange={e => setEditForm(f => ({...f, points: e.target.value}))}
                                            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button onClick={handleUpdate} disabled={updating}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60">
                                    {updating ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                    {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                                {selected.role !== 'ADMIN' && (
                                    <button onClick={() => { setDeleteConfirm(selected); setSelected(null); }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors">
                                        <Trash2 size={14} />
                                        Hapus
                                    </button>
                                )}
                                {updateMsg && (
                                    <span className={`text-sm font-semibold ${updateMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {updateMsg}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
                                <AlertTriangle size={28} className="text-red-500" />
                            </div>
                            <h3 className="font-black text-lg text-text-primary">Hapus User?</h3>
                            <p className="text-sm text-text-secondary">
                                Akun <span className="font-bold text-text-primary">{deleteConfirm.fullName}</span> akan dihapus permanen dan tidak dapat dipulihkan.
                            </p>
                            <div className="flex gap-3 w-full mt-2">
                                <button onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary font-bold text-sm hover:bg-gray-100 transition-colors">
                                    Batal
                                </button>
                                <button onClick={handleDelete} disabled={deleting}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                    {deleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
