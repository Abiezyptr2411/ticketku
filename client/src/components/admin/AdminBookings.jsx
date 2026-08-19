import { useState, useEffect, useCallback } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Eye, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const STATUS_CONFIG = {
    PAID:    { label: 'PAID',    color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    PENDING: { label: 'PENDING', color: 'text-orange-500 bg-orange-50 border-orange-200' },
    FAILED:  { label: 'FAILED',  color: 'text-red-500 bg-red-50 border-red-200' },
    EXPIRED: { label: 'EXPIRED', color: 'text-gray-500 bg-gray-100 border-gray-200' },
};

const BOOKING_STATUS_CONFIG = {
    COMPLETED:       { label: 'COMPLETED',       color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    PENDING:         { label: 'PENDING',         color: 'text-orange-500 bg-orange-50 border-orange-200' },
    PAYMENT_PENDING: { label: 'PAY PENDING',     color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    FAILED:          { label: 'FAILED',          color: 'text-red-500 bg-red-50 border-red-200' },
    CANCELLED:       { label: 'CANCELLED',       color: 'text-gray-500 bg-gray-100 border-gray-200' },
    EXPIRED:         { label: 'EXPIRED',         color: 'text-gray-500 bg-gray-100 border-gray-200' },
};

const PAYMENT_STATUSES = ['ALL', 'PAID', 'PENDING', 'FAILED', 'EXPIRED'];
const PAYMENT_STATUS_OPTIONS = ['PAID', 'PENDING', 'FAILED', 'EXPIRED'];
const BOOKING_STATUS_OPTIONS = ['PENDING', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED', 'FAILED', 'EXPIRED'];

function StatusBadge({ status, config }) {
    const cfg = config[status] || { label: status, color: 'text-gray-500 bg-gray-100 border-gray-200' };
    return (
        <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md border ${cfg.color}`}>
            {cfg.label}
        </span>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatIDR(num) {
    return 'Rp ' + (num || 0).toLocaleString('id-ID');
}

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selected, setSelected] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [updateMsg, setUpdateMsg] = useState('');
    const [editPayStatus, setEditPayStatus] = useState('');
    const [editBookStatus, setEditBookStatus] = useState('');

    const LIMIT = 10;

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: LIMIT });
            if (statusFilter !== 'ALL') params.append('status', statusFilter);
            if (search) params.append('search', search);
            const res = await api.get(`/admin/bookings?${params.toString()}`);
            setBookings(res.data.bookings);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, search]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    // Reset page when filter/search changes
    const handleStatusFilter = (s) => { setStatusFilter(s); setPage(1); };
    const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };
    const clearSearch = () => { setSearchInput(''); setSearch(''); setPage(1); };

    const openDetail = (b) => {
        setSelected(b);
        setEditPayStatus(b.paymentStatus);
        setEditBookStatus(b.bookingStatus);
        setUpdateMsg('');
    };

    const handleUpdate = async () => {
        if (!selected) return;
        setUpdating(true);
        setUpdateMsg('');
        try {
            await api.patch(`/admin/bookings/${selected._id}/status`, {
                paymentStatus: editPayStatus,
                bookingStatus: editBookStatus
            });
            setUpdateMsg('✓ Status berhasil diperbarui');
            fetchBookings();
            setSelected(prev => ({ ...prev, paymentStatus: editPayStatus, bookingStatus: editBookStatus }));
        } catch (err) {
            setUpdateMsg('✗ Gagal memperbarui status');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-text-primary">Booking Management</h2>
                    <p className="text-sm text-text-secondary mt-0.5">{total} total transaksi ditemukan</p>
                </div>
                <button onClick={fetchBookings} className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-gray-100 transition-colors text-sm font-medium self-start md:self-auto">
                    <RefreshCw size={15} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Filters Row */}
            <div className="bg-white rounded-2xl border border-border p-4 mb-4 flex flex-col md:flex-row gap-3">
                {/* Status filter tabs */}
                <div className="flex gap-1.5 flex-wrap">
                    {PAYMENT_STATUSES.map(s => (
                        <button
                            key={s}
                            onClick={() => handleStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                statusFilter === s
                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                    : 'text-text-secondary border-border hover:border-primary/40 hover:text-primary'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2 ml-auto w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            placeholder="Cari kode / nama user..."
                            className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        {searchInput && (
                            <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
                        Cari
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-text-secondary uppercase bg-gray-50/70 border-b border-border">
                            <tr>
                                <th className="px-5 py-4 font-bold tracking-wider">Booking Code</th>
                                <th className="px-5 py-4 font-bold tracking-wider">User</th>
                                <th className="px-5 py-4 font-bold tracking-wider">Rute</th>
                                <th className="px-5 py-4 font-bold tracking-wider">Metode</th>
                                <th className="px-5 py-4 font-bold tracking-wider">Pay Status</th>
                                <th className="px-5 py-4 font-bold tracking-wider">Booking Status</th>
                                <th className="px-5 py-4 font-bold tracking-wider">Total</th>
                                <th className="px-5 py-4 font-bold tracking-wider">Tanggal</th>
                                <th className="px-5 py-4 font-bold tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-16 text-text-secondary">
                                    <div className="flex flex-col items-center gap-2">
                                        <RefreshCw size={22} className="animate-spin text-primary/60" />
                                        <span className="text-sm">Memuat data...</span>
                                    </div>
                                </td></tr>
                            ) : bookings.length === 0 ? (
                                <tr><td colSpan={9} className="text-center py-16 text-text-secondary">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle size={32} className="text-gray-300" />
                                        <span className="font-medium text-sm">Tidak ada booking ditemukan</span>
                                    </div>
                                </td></tr>
                            ) : bookings.map((b) => (
                                <tr key={b._id} className="border-b border-border/40 hover:bg-gray-50/70 transition-colors cursor-pointer" onClick={() => openDetail(b)}>
                                    <td className="px-5 py-4 font-mono font-bold text-[11px] text-primary tracking-tight">{b.bookingCode}</td>
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-text-primary leading-tight">{b.user?.fullName || '-'}</div>
                                        <div className="text-xs text-text-secondary">{b.user?.email || ''}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-text-primary text-xs">
                                            <span className="text-gray-400">{b.schedule?.departureStation?.code}</span>
                                            <span className="mx-1">→</span>
                                            {b.schedule?.arrivalStation?.code}
                                        </div>
                                        <div className="text-[10px] text-text-secondary">{b.schedule?.train?.name || ''}</div>
                                    </td>
                                    <td className="px-5 py-4 font-medium text-xs text-text-secondary whitespace-nowrap">{b.paymentMethod || '-'}</td>
                                    <td className="px-5 py-4"><StatusBadge status={b.paymentStatus} config={STATUS_CONFIG} /></td>
                                    <td className="px-5 py-4"><StatusBadge status={b.bookingStatus} config={BOOKING_STATUS_CONFIG} /></td>
                                    <td className="px-5 py-4 font-bold text-text-primary whitespace-nowrap">{formatIDR(b.totalPrice)}</td>
                                    <td className="px-5 py-4 text-xs text-text-secondary whitespace-nowrap">{formatDate(b.createdAt)}</td>
                                    <td className="px-5 py-4 text-center">
                                        <button onClick={(e) => { e.stopPropagation(); openDetail(b); }}
                                            className="p-2 rounded-lg bg-primary/5 text-primary hover:bg-primary/15 transition-colors">
                                            <Eye size={15} />
                                        </button>
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
                            Halaman <span className="font-bold">{page}</span> dari <span className="font-bold">{totalPages}</span> &nbsp;·&nbsp; {total} data
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

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="font-black text-lg text-text-primary">Detail Booking</h3>
                                <p className="text-xs font-mono text-primary font-bold mt-0.5">{selected.bookingCode}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* User & Schedule Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoCard title="Informasi User">
                                    <InfoRow label="Nama" value={selected.user?.fullName} />
                                    <InfoRow label="Email" value={selected.user?.email} />
                                    <InfoRow label="Phone" value={selected.user?.phone || '-'} />
                                </InfoCard>
                                <InfoCard title="Rute & Kereta">
                                    <InfoRow label="Kereta" value={`${selected.schedule?.train?.name || '-'} (${selected.schedule?.train?.code || ''})`} />
                                    <InfoRow label="Dari" value={`${selected.schedule?.departureStation?.name || '-'} (${selected.schedule?.departureStation?.code || ''})`} />
                                    <InfoRow label="Ke" value={`${selected.schedule?.arrivalStation?.name || '-'} (${selected.schedule?.arrivalStation?.code || ''})`} />
                                    <InfoRow label="Kelas" value={selected.schedule?.train?.class || '-'} />
                                </InfoCard>
                            </div>

                            {/* Passengers */}
                            {selected.passengers?.length > 0 && (
                                <InfoCard title={`Penumpang (${selected.passengers.length})`}>
                                    <div className="space-y-2 mt-2">
                                        {selected.passengers.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                                <div>
                                                    <p className="font-semibold text-sm text-text-primary">{p.fullName}</p>
                                                    <p className="text-xs text-text-secondary">ID: {p.idNumber} · {p.gender}</p>
                                                </div>
                                                <span className="text-xs text-primary font-bold bg-primary/5 px-2 py-1 rounded-lg">
                                                    {selected.seats?.[i]?.seatNumber ? `Kursi ${selected.seats[i].seatNumber}` : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </InfoCard>
                            )}

                            {/* Payment Info */}
                            <InfoCard title="Informasi Pembayaran">
                                <InfoRow label="Metode" value={selected.paymentMethod || '-'} />
                                <InfoRow label="Harga Tiket" value={formatIDR(selected.price)} />
                                <InfoRow label="Admin Fee" value={formatIDR(selected.adminFee)} />
                                <InfoRow label="Total" value={<span className="font-black text-primary">{formatIDR(selected.totalPrice)}</span>} />
                                <InfoRow label="Tanggal" value={formatDate(selected.createdAt)} />
                            </InfoCard>

                            {/* Update Status */}
                            <InfoCard title="Update Status Booking">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary mb-1.5">Payment Status</label>
                                        <select value={editPayStatus} onChange={e => setEditPayStatus(e.target.value)}
                                            className="w-full border border-border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                                            {PAYMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary mb-1.5">Booking Status</label>
                                        <select value={editBookStatus} onChange={e => setEditBookStatus(e.target.value)}
                                            className="w-full border border-border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                                            {BOOKING_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-4">
                                    <button onClick={handleUpdate} disabled={updating}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60">
                                        {updating ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                        {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                    {updateMsg && (
                                        <span className={`text-sm font-semibold ${updateMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {updateMsg}
                                        </span>
                                    )}
                                </div>
                            </InfoCard>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoCard({ title, children }) {
    return (
        <div className="bg-gray-50/70 rounded-2xl border border-border/60 p-4">
            <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3">{title}</h4>
            {children}
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-1.5 text-sm border-b border-border/30 last:border-0">
            <span className="text-text-secondary font-medium">{label}</span>
            <span className="font-semibold text-text-primary text-right max-w-[55%]">{value}</span>
        </div>
    );
}
