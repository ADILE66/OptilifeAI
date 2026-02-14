import React, { useState, useEffect, useContext, useMemo } from 'react';
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

    const loadUsers = () => {
        const allUsers = getAllUsers();
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
            { id: 'activity', key: 'activityLogs', name: t('nav.activity') }, // use durationMinutes
            { id: 'fasting', key: 'fastingLogs', name: t('nav.fasting') }, // calc from timestamps
            { id: 'sleep', key: 'sleepLogs', name: t('nav.sleep') } // use durationMinutes
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

    const handleDelete = (userId: string) => {
        if (userId === authUser?.id) {
            alert("Action impossible : vous ne pouvez pas supprimer votre propre compte administrateur.");
            return;
        }

        if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur et TOUTES ses données ?")) {
            setLoadingAction(userId);
            try {
                deleteUser(userId);
                const updatedUsers = getAllUsers();
                setUsers(updatedUsers);
                calculateStatsTrend(updatedUsers);
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
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        await updateUserRole(userId, newRole);
        loadUsers();
        setLoadingAction(null);
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction('create');
        const admin = await createAdmin(newAdmin.email, newAdmin.password, newAdmin.firstName, newAdmin.lastName);
        if (admin) {
            setIsAddModalOpen(false);
            setNewAdmin({ email: '', password: '', firstName: '', lastName: '' });
            loadUsers();
        } else {
            alert("Erreur : cet email est déjà utilisé.");
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
                <StatCard title={t('admin.totalUsers')} value={totalUsers} icon={IconUser} color="bg-brand-500" />
                <StatCard title={t('admin.proUsers')} value={proCount} icon={IconStar} color="bg-amber-500" />
                <StatCard title="Admin" value={adminCount} icon={IconShield} color="bg-red-500" />
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2 mb-1">
                            <IconActivity className="w-6 h-6 text-brand-500" />
                            {statMode === 'adoption' ? "Adoption des Modules (%)" : "Durée d'utilisation (min/utilisateur)"}
                        </h2>
                        <p className="text-sm text-slate-400 font-medium">Données consolidées sur les 3 derniers mois</p>
                    </div>

                    <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
                        <button
                            onClick={() => setStatMode('adoption')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statMode === 'adoption' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Adoption
                        </button>
                        <button
                            onClick={() => setStatMode('duration')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statMode === 'duration' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Durée
                        </button>
                    </div>
                </div>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statsTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                unit={statMode === 'adoption' ? "%" : "m"}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(51, 65, 85, 0.5)' }}
                                contentStyle={{ borderRadius: '20px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '25px' }} iconType="circle" />
                            <Bar name={t('nav.water')} dataKey={`water_${statMode}`} fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                            <Bar name={t('nav.food')} dataKey={`food_${statMode}`} fill="#f97316" radius={[6, 6, 0, 0]} />
                            <Bar name={t('nav.activity')} dataKey={`activity_${statMode}`} fill="#10b981" radius={[6, 6, 0, 0]} />
                            <Bar name={t('nav.fasting')} dataKey={`fasting_${statMode}`} fill="#a855f7" radius={[6, 6, 0, 0]} />
                            <Bar name={t('nav.sleep')} dataKey={`sleep_${statMode}`} fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-800 overflow-hidden">
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                    <h2 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-wider">
                        <IconShield className="w-6 h-6 text-red-500" />
                        {t('admin.title')}
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">{t('admin.user')}</th>
                                <th className="p-6">{t('admin.role')}</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {users.map(user => {
                                const isPro = JSON.parse(localStorage.getItem(`isProMember_${user.id}`) || 'false');
                                const isSelf = user.id === authUser?.id;
                                const isActionLoading = loadingAction === user.id || loadingAction === `role-${user.id}`;

                                return (
                                    <tr key={user.id} className={`hover:bg-slate-800/50 transition-colors group ${isActionLoading ? 'opacity-40' : ''}`}>
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[1rem] bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border-2 border-slate-700 shadow-sm group-hover:scale-105 transition-transform">
                                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <IconUser className="w-6 h-6 text-slate-400" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white leading-tight">
                                                        {user.firstName} {user.lastName || user.email.split('@')[0]}
                                                        {isSelf && <span className="ml-2 text-[9px] bg-brand-500 text-white px-2 py-0.5 rounded-full font-black uppercase">Moi</span>}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <button
                                                onClick={() => handleToggleRole(user.id, user.role)}
                                                disabled={isSelf || isActionLoading}
                                                className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-xl border transition-all ${user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-brand-500/10 text-brand-400 border-brand-500/20 hover:scale-105'} disabled:opacity-50`}
                                            >
                                                {loadingAction === `role-${user.id}` ? <IconLoader className="w-3 h-3 animate-spin" /> : user.role}
                                            </button>
                                        </td>
                                        <td className="p-6">
                                            {isPro ? (
                                                <span className="flex items-center gap-2 text-xs font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full w-fit border border-amber-500/20"><IconStar className="w-3.5 h-3.5" fill="currentColor" /> PRO</span>
                                            ) : (
                                                <span className="text-xs font-black text-slate-400 bg-slate-800 px-3 py-1 rounded-full w-fit border border-slate-700">GUEST</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={isSelf || isActionLoading}
                                                    className={`p-3 rounded-2xl transition-all ${isSelf ? 'text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:text-red-400 hover:bg-slate-800 hover:shadow-sm'}`}
                                                    title={isSelf ? "Impossible" : "Supprimer définitivement"}
                                                >
                                                    {loadingAction === user.id ? <IconLoader className="w-5 h-5 animate-spin" /> : <IconTrash className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex justify-center items-center p-4">
                    <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-800">
                        <div className="p-8 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-black text-white flex items-center gap-3"><IconShield className="w-7 h-7 text-red-500" />{t('admin.addAdminTitle')}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full shadow-sm border border-slate-700"><IconX className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleAddAdmin} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Prénom" value={newAdmin.firstName} onChange={v => setNewAdmin({ ...newAdmin, firstName: v })} required />
                                <Input label="Nom" value={newAdmin.lastName} onChange={v => setNewAdmin({ ...newAdmin, lastName: v })} required />
                            </div>
                            <Input label="Email" type="email" value={newAdmin.email} onChange={v => setNewAdmin({ ...newAdmin, email: v })} required />
                            <Input label="Mot de passe" type="password" value={newAdmin.password} onChange={v => setNewAdmin({ ...newAdmin, password: v })} required />

                            <button
                                type="submit"
                                disabled={loadingAction === 'create'}
                                className="w-full mt-6 py-4 bg-brand-600 text-white font-black rounded-[1.25rem] hover:bg-brand-500 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-brand-900/40 active:scale-95 disabled:bg-slate-700 disabled:text-slate-500 uppercase tracking-widest text-sm"
                            >
                                {loadingAction === 'create' ? <IconLoader className="w-5 h-5 animate-spin" /> : <IconCheckCircle className="w-5 h-5" />}
                                Créer l'administrateur
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard: React.FC<{ title: string, value: number, icon: any, color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-slate-900 p-8 rounded-[2.25rem] shadow-sm border border-slate-800 flex items-center gap-6 group hover:shadow-md hover:shadow-slate-900/50 transition-all">
        <div className={`w-16 h-16 ${color} text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon className="w-8 h-8" />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-4xl font-black text-white tracking-tight">{value}</p>
        </div>
    </div>
);

const Input: React.FC<{ label: string, value: string, onChange: (v: string) => void, type?: string, required?: boolean }> = ({ label, value, onChange, type = 'text', required }) => (
    <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            required={required}
            className="w-full px-5 py-3 bg-slate-800 border border-slate-700 rounded-[1rem] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-white placeholder:text-slate-600"
        />
    </div>
);

export default AdminDashboard;