import React, { useState } from 'react';
import { IconStar, IconX, IconCamera, IconChartBar, IconMic, IconLoader } from './Icons';
import { handleCheckout } from '../services/stripeService';
import { useTranslation } from '../i18n/i18n';

interface ProModalProps {
    onClose: () => void;
}

const ProModal: React.FC<ProModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const onUpgradeClick = async () => {
        setIsLoading(true);
        try {
            await handleCheckout();
        } catch (error) {
            console.error("Checkout failed", error);
            setIsLoading(false);
            // Optionally show an error message to the user
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm text-center p-8 relative transform animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><IconX className="w-6 h-6" /></button>
                
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                    <IconStar className="w-12 h-12 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-slate-800 mt-2">{t('proModal.title')}</h3>
                <p className="text-slate-500 mt-2 mb-6">{t('proModal.description')}</p>

                <ul className="space-y-3 text-left mb-8">
                    <li className="flex items-center gap-3">
                        <IconCamera className="w-6 h-6 text-brand-500" />
                        <div>
                            <p className="font-semibold text-slate-700">{t('proModal.feature1Title')}</p>
                            <p className="text-xs text-slate-500">{t('proModal.feature1Desc')}</p>
                        </div>
                    </li>
                    <li className="flex items-center gap-3">
                        <IconChartBar className="w-6 h-6 text-brand-500" />
                        <div>
                            <p className="font-semibold text-slate-700">{t('proModal.feature2Title')}</p>
                            <p className="text-xs text-slate-500">{t('proModal.feature2Desc')}</p>
                        </div>
                    </li>
                    <li className="flex items-center gap-3">
                        <IconMic className="w-6 h-6 text-brand-500" />
                        <div>
                            <p className="font-semibold text-slate-700">{t('proModal.feature3Title')}</p>
                            <p className="text-xs text-slate-500">{t('proModal.feature3Desc')}</p>
                        </div>
                    </li>
                </ul>

                <button 
                    onClick={onUpgradeClick} 
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400"
                >
                    {isLoading ? (
                        <>
                            <IconLoader className="w-5 h-5 animate-spin" />
                            {t('proModal.loading')}
                        </>
                    ) : (
                        t('proModal.button')
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProModal;