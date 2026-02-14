import * as React from 'react';
import { useState, useEffect, useContext, useMemo } from 'react';
import { User } from '../types';
import { getAllUsers, deleteUser, updateUserRole, createAdmin } from '../services/authService';
import { IconShield, IconTrash, IconUser, IconStar, IconCheckCircle, IconLoader, IconPlus, IconX, IconActivity, IconClock } from '../components/Icons';
import { useTranslation } from '../i18n/i18n';
import { AuthContext } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser: authUser } = useContext(AuthContext);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [statMode, setStatMode] = useState<'adoption' | 'duration'>('adoption');

    // Analytics state
    const [statsTrend, setStatsTrend] = useState<any[]>([]);

    const [newAdmin, setNewAdmin] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
        calculateStatsTrend(allUsers);
    };

    const calculateStatsTrend = (allUsers: User[]) => {
        const now = new Date();
        const totalUsersCount = allUsers.length || 1;

        // Months labels (Last 3)
        const months = Array.from({ length: 3 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
            return {
                label: d.toLocaleDateString('fr-FR', { month: 'short' }),
                timestampStart: d.getTime(),
                timestampEnd: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime()
            };
        });

        const modules = [
            { id: 'water', key: 'waterLogs', name: t('nav.water'), estMin: 0.5 },
            { id: 'food', key: 'foodLogs', name: t('nav.food'), estMin: 2 },
            { id: 'activity', key: 'activityLogs', name: t('nav.activity') },
            { id: 'fasting', key: 'fastingLogs', name: t('nav.fasting') },
            { id: 'sleep', key: 'sleepLogs', name: t('nav.sleep') }
        ];

        const trendData = months.map(month => {
            const result: any = { month: month.label };
            modules.forEach(mod => {
                let activeInModule = 0;
                let totalMinutes = 0;

                allUsers.forEach(u => {
                    const logs = JSON.parse(localStorage.getItem(`${mod.key}_${u.id}`) || '[]');
                    const logsInMonth = logs.filter((l: any) => {
                        const ts = l.timestamp || l.endTime || l.startTime;
                        return ts >= month.timestampStart && ts <= month.timestampEnd;
                    });

                    if (logsInMonth.length > 0) {
                        activeInModule++;
                        // Calculate duration
                        if (mod.id === 'activity' || mod.id === 'sleep') {
                            totalMinutes += logsInMonth.reduce((sum: number, l: any) => sum + (l.durationMinutes || 0), 0);
                        } else if (mod.id === 'fasting') {
                            totalMinutes += logsInMonth.reduce((sum: number, l: any) => {
                                if (l.endTime && l.startTime) return sum + (l.endTime - l.startTime) / 60000;
                                return sum;
                            }, 0);
                        } else {
                            totalMinutes += logsInMonth.length * (mod.estMin || 0);
                        }
                    }
                });

                result[`${mod.id}_adoption`] = Math.round((activeInModule / totalUsersCount) * 100);
                result[`${mod.id}_duration`] = activeInModule > 0 ? Math.round(totalMinutes / activeInModule) : 0;
            });
            return result;
        });

        setStatsTrend(trendData);
    };

    const handleDelete = async (userId: string) => {
        if (userId === authUser?.id) {
            alert("Action impossible : vous ne pouvez pas supprimer votre propre compte administrateur.");
            return;
        }

        if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur et TOUTES ses données ?")) {
            setLoadingAction(userId);
            try {
                await deleteUser(userId);
                await loadUsers();
            } catch (err) {
                console.error("Erreur lors de la suppression:", err);
                alert("Une erreur est survenue lors de la suppression.");
            } finally {
                setLoadingAction(null);
            }
        }
    };

    const handleToggleRole = async (userId: string, currentRole: string) => {
        if (userId === authUser?.id) return;
        setLoadingAction(`role-${userId}`);
        const newRole = (currentRole === 'admin' ? 'user' : 'admin') as 'user' | 'admin';
        await updateUserRole(userId, newRole);
        await loadUsers();
        setLoadingAction(null);
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction('create');
        try {
            await createAdmin(newAdmin);
            setIsAddModalOpen(false);
            setNewAdmin({ email: '', password: '', firstName: '', lastName: '' });
            await loadUsers();
        } catch (err) {
            alert("Erreur lors de la création de l'administrateur.");
        }
        setLoadingAction(null);
    };

    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const proCount = users.filter(u => JSON.parse(localStorage.getItem(`isProMember_${u.id}`) || 'false')).length;

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">{t('admin.statsTitle')}</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-brand-600 text-white font-bold px-6 py-3 rounded-[1.25rem] hover:bg-brand-500 transition-all flex items-center gap-2 shadow-xl shadow-brand-900/20 hover:shadow-2xl active:scale-95"
                >
                    <IconPlus className="w-5 h-5" />
                    {t('admin.addAdmin')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-sm transition-all hover:shadow-lg">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{t('admin.totalUsers')}</p>
                    <p className="text-4xl font-black text-white">{totalUsers}</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-sm transition-all hover:shadow-lg">
                    <p className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-1">{t('dashboard.proFeatureTitle')}</p>
                    <p className="text-4xl font-black text-white">{proCount}</p>
                    <p className="text-xs text-slate-500 mt-1">{Math.round((proCount / (totalUsers || 1)) * 100)}% de conversion</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-sm transition-all hover:shadow-lg">
                    <p className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-1">{t('nav.settings')}</p>
                    <p className="text-4xl font-black text-white">{adminCount}</p>
                </div>
            </div>

            {/* ANALYTICS CHARTS */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase">{t('admin.adoptionTitle')}</h2>
                        <p className="text-sm text-slate-500">{t('admin.adoptionSubtitle')}</p>
                    </div>
                    <div className="flex bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setStatMode('adoption')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statMode === 'adoption' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            % Adoption
                        </button>
                        <button
                            onClick={() => setStatMode('duration')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statMode === 'duration' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Moy. Utilisation
                        </button>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statsTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}
                                itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar name={t('nav.water')} dataKey={`water_${statMode}`} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar name={t('nav.food')} dataKey={`food_${statMode}`} fill="#f97316" radius={[4, 4, 0, 0]} />
                            <Bar name={t('nav.activity')} dataKey={`activity_${statMode}`} fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar name={t('nav.fasting')} dataKey={`fasting_${statMode}`} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            <Bar name={t('nav.sleep')} dataKey={`sleep_${statMode}`} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* USERS TABLE */}
            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h2 className="text-xl font-black text-white uppercase">{t('admin.manageUsers')}</h2>
                    <span className="bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{users.length} {t('admin.totalUsers')}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/30">
                                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">{t('admin.userName')}</th>
                                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Statut</th>
                                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Abonnement</th>
                                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {users.map((user) => (
                                <tr key={user.id} className="group hover:bg-slate-800/20 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border-2 border-slate-700/50 transition-all group-hover:border-brand-500/50 group-hover:bg-slate-700">
                                                {user.avatar ? (
                                                    <img src={user.avatar} className="w-full h-full rounded-2xl object-cover" alt="" />
                                                ) : (
                                                    <IconUser className="w-6 h-6 text-slate-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-lg leading-tight">{user.firstName} {user.lastName}</p>
                                                <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button
                                            onClick={() => handleToggleRole(user.id, user.role)}
                                            disabled={loadingAction === `role-${user.id}` || user.id === authUser?.id}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${user.role === 'admin'
                                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20'
                                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                                                } disabled:opacity-50`}
                                        >
                                            {loadingAction === `role-${user.id}` ? <IconLoader className="w-4 h-4 animate-spin" /> : user.role === 'admin' ? <IconShield className="w-4 h-4" /> : <IconUser className="w-4 h-4" />}
                                            {user.role}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        {JSON.parse(localStorage.getItem(`isProMember_${user.id}`) || 'false') ? (
                                            <span className="flex items-center gap-1.5 text-amber-500 font-black text-xs uppercase tracking-widest py-2 px-4 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-sm">
                                                <IconStar className="w-4 h-4 fill-amber-500" />
                                                PREMIUM
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 font-black text-xs uppercase tracking-widest py-2 px-4 bg-slate-800/50 rounded-xl border border-slate-800 box-content">Standard</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                disabled={loadingAction === user.id || user.id === authUser?.id}
                                                className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all disabled:opacity-50 group-hover:scale-110"
                                                title={t('admin.deleteUser')}
                                            >
                                                {loadingAction === user.id ? <IconLoader className="w-5 h-5 animate-spin" /> : <IconTrash className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD ADMIN MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[60] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-700 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-2xl"><IconX className="w-6 h-6" /></button>

                        <div className="p-10">
                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{t('admin.addAdmin')}</h3>
                                <p className="text-slate-500 text-sm font-medium">Créez un nouvel accès administrateur pour la plateforme.</p>
                            </div>

                            <form onSubmit={handleAddAdmin} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Prénom</label>
                                        <input
                                            type="text"
                                            required
                                            value={newAdmin.firstName}
                                            onChange={e => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                                            placeholder="Ex: Omar"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nom</label>
                                        <input
                                            type="text"
                                            required
                                            value={newAdmin.lastName}
                                            onChange={e => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                                            placeholder="Ex: Temsamani"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={newAdmin.email}
                                        onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                                        placeholder="omar@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mot de passe provisoire</label>
                                    <input
                                        type="password"
                                        required
                                        value={newAdmin.password}
                                        onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                                        placeholder="Minimum 6 caractères"
                                        minLength={6}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loadingAction === 'create'}
                                    className="w-full py-5 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-500 transition-all shadow-xl shadow-brand-900/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                                >
                                    {loadingAction === 'create' ? <IconLoader className="w-6 h-6 animate-spin" /> : <><IconCheckCircle className="w-6 h-6" /> {t('admin.addAdmin')}</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;