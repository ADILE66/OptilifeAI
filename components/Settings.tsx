
import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { NotificationSettings, UserProfile, User, UserGoals } from '../types';
// FIX: Added IconTrash to the imports from ./Icons
import { IconBell, IconUser, IconLock, IconUpload, IconLoader, IconChartBar, IconTrophy, IconSparkles, IconFire, IconActivity, IconShield, IconEye, IconEyeOff, IconCheckCircle, IconX, IconClock, IconSatellite, IconTrash } from './Icons';
import { AuthContext } from '../contexts/AuthContext';
import * as authService from '../services/authService';
import { useTranslation } from '../i18n/i18n';
import { useNavigate } from 'react-router-dom';

interface SettingsProps {
    settings: NotificationSettings;
    onSettingsChange: (newSettings: NotificationSettings) => void;
    profile: UserProfile;
    onProfileChange: (newProfile: UserProfile) => void;
    goals: UserGoals;
    onGoalsChange: (newGoals: UserGoals) => void;
    updateCurrentUser: (user: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange, profile, onProfileChange, goals, onGoalsChange }) => {
    const { currentUser, logout, updateCurrentUser } = useContext(AuthContext);
    const { t, setLanguage, language } = useTranslation();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState(currentUser?.firstName || '');
    const [lastName, setLastName] = useState(currentUser?.lastName || '');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [localProfile, setLocalProfile] = useState(profile);
    const [localGoals, setLocalGoals] = useState(goals);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isPasswordChanging, setIsPasswordChanging] = useState(false);

    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const [profileSaveSuccess, setProfileSaveSuccess] = useState('');

    // Security Features State
    const [showMfaModal, setShowMfaModal] = useState(false);
    const [isMfaEnabled, setIsMfaEnabled] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const passwordStrength = useMemo(() => {
        if (!newPassword) return 0;
        let score = 0;
        if (newPassword.length > 8) score++;
        if (/[A-Z]/.test(newPassword)) score++;
        if (/[0-9]/.test(newPassword)) score++;
        if (/[^A-Za-z0-9]/.test(newPassword)) score++;
        return score;
    }, [newPassword]);

    const getStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength <= 2) return 'bg-amber-500';
        if (passwordStrength <= 3) return 'bg-emerald-400';
        return 'bg-emerald-600';
    };

    const getBmiInfo = (bmi: number | null): { category: string, color: string } => {
        if (bmi === null || isNaN(bmi) || !isFinite(bmi)) return { category: t('settings.bmiCategory.na'), color: 'text-slate-500' };
        if (bmi < 18.5) return { category: t('settings.bmiCategory.underweight'), color: 'text-blue-500' };
        if (bmi < 25) return { category: t('settings.bmiCategory.normal'), color: 'text-emerald-500' };
        if (bmi < 30) return { category: t('settings.bmiCategory.overweight'), color: 'text-amber-500' };
        return { category: t('settings.bmiCategory.obesity'), color: 'text-red-500' };
    };

    useEffect(() => { setLocalProfile(profile); }, [profile]);
    useEffect(() => { setLocalGoals(goals); }, [goals]);
    useEffect(() => {
        if (currentUser) {
            setFirstName(currentUser.firstName || '');
            setLastName(currentUser.lastName || '');
        }
    }, [currentUser]);

    const handleProfileSave = async () => {
        if (!currentUser) return;
        setIsProfileSaving(true);
        setProfileSaveSuccess('');
        try {
            const updatedUser = await authService.updateUserName(currentUser.id, firstName, lastName);
            updateCurrentUser(updatedUser);
            onProfileChange(localProfile);
            onGoalsChange(localGoals);
            setProfileSaveSuccess(t('settings.profileSuccess'));
            setTimeout(() => setProfileSaveSuccess(''), 3000);
        } catch (error) {
            console.error("Failed to save profile", error);
        } finally {
            setIsProfileSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(''); setPasswordSuccess('');
        if (newPassword !== confirmPassword) { setPasswordError("Les mots de passe ne correspondent pas."); return; }
        if (newPassword.length < 6) { setPasswordError("6 caractères minimum."); return; }
        setIsPasswordChanging(true);
        if (currentUser) {
            const result = await authService.changePassword(currentUser.id, oldPassword, newPassword);
            if (result.success) {
                setPasswordSuccess(t('settings.passwordSuccess'));
                setOldPassword(''); setNewPassword(''); setConfirmPassword('');
            } else setPasswordError(result.message || 'Erreur');
        }
        setIsPasswordChanging(false);
    };

    const handleDeleteAccount = async () => {
        if (!currentUser) return;
        authService.deleteUser(currentUser.id);
        logout();
        navigate('/');
    };

    const bmi = useMemo(() => {
        if (localProfile.weightKg && localProfile.heightCm) {
            const heightM = localProfile.heightCm / 100;
            return localProfile.weightKg / (heightM * heightM);
        }
        return null;
    }, [localProfile.weightKg, localProfile.heightCm]);

    return (
        <div className="space-y-8 pb-20">
            {/* 1. SECTION PROFIL (Existing but styled) */}
            <section className="bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-800 p-8">
                <h2 className="text-xl font-black text-white flex items-center gap-3 mb-8"><IconUser className="w-6 h-6 text-brand-500" />{t('settings.profileTitle')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-32 h-32 rounded-[2rem] bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-slate-700 shadow-lg">
                            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : currentUser?.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <IconUser className="w-12 h-12 text-slate-600" />}
                        </div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setImagePreview(reader.result as string);
                                reader.readAsDataURL(file);
                            }
                        }} className="hidden" />

                        {imagePreview ? (
                            <div className="flex gap-2">
                                <button onClick={async () => {
                                    if (imagePreview && currentUser) {
                                        await authService.updateProfilePicture(currentUser.id, imagePreview);
                                        updateCurrentUser({ ...currentUser, avatar: imagePreview });
                                        setImagePreview(null);
                                    }
                                }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-emerald-500">{t('settings.save')}</button>
                                <button onClick={() => setImagePreview(null)} className="bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-slate-600">{t('settings.cancel')}</button>
                            </div>
                        ) : (
                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-400 hover:text-brand-300 bg-brand-500/10 px-6 py-3 rounded-2xl transition-all active:scale-95">
                                <IconUpload className="w-4 h-4" /> {t('settings.changePhoto')}
                            </button>
                        )}
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputWithLabel label={t('settings.firstName')} value={firstName} onChange={e => setFirstName(e.target.value)} />
                            <InputWithLabel label={t('settings.lastName')} value={lastName} onChange={e => setLastName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <InputWithLabel label={t('settings.age')} value={localProfile.age ?? ''} type="number" onChange={e => setLocalProfile({ ...localProfile, age: +e.target.value })} />
                            <InputWithLabel label={`${t('settings.weight')} (${t('settings.weightUnit')})`} value={localProfile.weightKg ?? ''} type="number" onChange={e => setLocalProfile({ ...localProfile, weightKg: +e.target.value })} />
                            <InputWithLabel label={`${t('settings.height')} (${t('settings.heightUnit')})`} value={localProfile.heightCm ?? ''} type="number" onChange={e => setLocalProfile({ ...localProfile, heightCm: +e.target.value })} />
                            <div className="flex flex-col items-center justify-center bg-slate-800 rounded-2xl border border-slate-700 p-2">
                                <p className="text-[8px] font-black text-slate-500 uppercase">{t('settings.bmiLabel')}</p>
                                <p className={`text-lg font-black ${getBmiInfo(bmi).color}`}>{bmi ? bmi.toFixed(1) : '-'}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 items-center">
                            {profileSaveSuccess && <span className="text-xs font-bold text-emerald-400 animate-in fade-in">{profileSaveSuccess}</span>}
                            <button onClick={handleProfileSave} disabled={isProfileSaving} className="bg-brand-600 text-white font-black px-8 py-3.5 rounded-2xl hover:bg-brand-500 disabled:bg-slate-700 flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-900/20 active:scale-95 text-sm uppercase tracking-widest">
                                {isProfileSaving && <IconLoader className="w-4 h-4 animate-spin" />}
                                {t('settings.updateProfileButton')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. SECTION SÉCURITÉ - MOT DE PASSE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-800 p-8">
                    <h2 className="text-lg font-black text-white flex items-center gap-3 mb-6"><IconLock className="w-5 h-5 text-brand-500" />{t('settings.securityTitle')}</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <InputWithLabel label={t('settings.currentPassword')} type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                        <div className="space-y-1">
                            <InputWithLabel label={t('settings.newPassword')} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            {newPassword && (
                                <div className="px-1 pt-1">
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-500 ${getStrengthColor()}`} style={{ width: `${(passwordStrength / 4) * 100}%` }} />
                                    </div>
                                    <p className="text-[10px] font-bold mt-1 text-slate-500 uppercase tracking-tighter">
                                        Complexité : {passwordStrength <= 1 ? 'Faible' : passwordStrength <= 2 ? 'Moyenne' : passwordStrength <= 3 ? 'Forte' : 'Excellente'}
                                    </p>
                                </div>
                            )}
                        </div>
                        <InputWithLabel label={t('settings.confirmNewPassword')} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />

                        {passwordError && <p className="text-xs font-bold text-red-500">{passwordError}</p>}
                        {passwordSuccess && <p className="text-xs font-bold text-emerald-500">{passwordSuccess}</p>}

                        <button type="submit" disabled={isPasswordChanging} className="w-full bg-slate-800 text-white font-black py-4 rounded-2xl hover:bg-slate-700 disabled:bg-slate-800 transition-all uppercase tracking-widest text-xs border border-slate-700">
                            {isPasswordChanging ? <IconLoader className="w-4 h-4 animate-spin mx-auto" /> : t('settings.changePasswordButton')}
                        </button>
                    </form>
                </section>

                {/* 3. SECTION MFA & SESSIONS */}
                <div className="space-y-8">
                    <section className="bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-800 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-black text-white flex items-center gap-3"><IconShield className="w-5 h-5 text-brand-500" />{t('settings.mfaTitle')}</h2>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isMfaEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                {isMfaEnabled ? t('settings.enabled') : t('settings.disabled')}
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">{t('settings.mfaDescription')}</p>
                        <button onClick={() => setShowMfaModal(true)} className="w-full border-2 border-slate-700 text-white font-black py-3 rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs">
                            {isMfaEnabled ? t('settings.configure') : t('settings.enableMfa')}
                        </button>
                    </section>

                    <section className="bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-800 p-8">
                        <h2 className="text-lg font-black text-white flex items-center gap-3 mb-6"><IconSatellite className="w-5 h-5 text-brand-500" />{t('settings.activeSessions')}</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-2xl border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800"><IconClock className="w-5 h-5 text-slate-500" /></div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Chrome sur MacOS</p>
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase">{t('settings.currentSession')}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-slate-500">Paris, FR</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* 4. SECTION LANGUE */}
            <section className="bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-800 p-8">
                <h2 className="text-lg font-black text-white flex items-center gap-3 mb-6">{t('settings.languageTitle')}</h2>
                <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => setLanguage('fr')} className={`py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 border-2 transition-all ${language === 'fr' ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        🇫🇷 Français
                    </button>
                    <button onClick={() => setLanguage('en')} className={`py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 border-2 transition-all ${language === 'en' ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        🇺🇸 English
                    </button>
                    <button onClick={() => setLanguage('es')} className={`py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 border-2 transition-all ${language === 'es' ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        🇪🇸 Español
                    </button>
                </div>
            </section>

            {/* 4. ZONE DE DANGER */}
            <section className="bg-red-900/10 rounded-[2.5rem] border border-red-900/30 p-8">
                <h2 className="text-lg font-black text-red-500 flex items-center gap-3 mb-4">{t('settings.dangerZone')}</h2>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <p className="font-bold text-white">{t('settings.deleteAccount')}</p>
                        <p className="text-xs text-red-300 max-w-md mt-1 leading-relaxed">{t('settings.deleteAccountWarning')}</p>
                    </div>
                    <button onClick={() => setShowDeleteModal(true)} className="bg-red-500 text-white font-black px-8 py-3.5 rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-900/30 active:scale-95 text-xs uppercase tracking-widest">
                        {t('settings.deleteAccountButton')}
                    </button>
                </div>
            </section>

            {/* Modals simulation */}
            {showMfaModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex justify-center items-center p-4">
                    <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-300 border border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white">{t('settings.mfaModalTitle')}</h3>
                            <button onClick={() => setShowMfaModal(false)} className="text-slate-400 hover:text-white"><IconX className="w-6 h-6" /></button>
                        </div>
                        <div className="text-center py-6">
                            <div className="w-32 h-32 bg-white mx-auto mb-6 flex items-center justify-center rounded-2xl border-2 border-slate-200">
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">[ QR CODE ]</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-6">{t('settings.mfaScan')}</p>
                            <button onClick={() => { setIsMfaEnabled(true); setShowMfaModal(false); }} className="w-full bg-brand-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-brand-500">{t('settings.mfaScanned')}</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-red-950/80 backdrop-blur-md z-[100] flex justify-center items-center p-4">
                    <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 duration-300 border border-red-900/30">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <IconTrash className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-white text-center mb-4">{t('settings.lastStep')}</h3>
                        <p className="text-center text-slate-400 mb-8 leading-relaxed text-sm">{t('settings.deleteConfirmText', { email: currentUser?.email })}</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setShowDeleteModal(false)} className="bg-slate-800 text-slate-300 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-700">{t('settings.cancel')}</button>
                            <button onClick={handleDeleteAccount} className="bg-red-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-red-900/30 hover:bg-red-500">{t('settings.confirm')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputWithLabel: React.FC<{ label: string, type?: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, type = 'text', value, onChange }) => (
    <div className="w-full">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            className="w-full px-5 py-3 bg-slate-800 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-white placeholder:text-slate-600"
        />
    </div>
);

export default Settings;
