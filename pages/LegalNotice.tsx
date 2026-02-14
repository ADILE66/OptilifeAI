import React from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft } from '../components/Icons';

const LegalNotice: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-500 mb-8 transition-colors font-bold text-sm">
                    <IconChevronLeft className="w-4 h-4" /> Retour à l'accueil
                </Link>

                <div className="bg-slate-900 shadow-sm rounded-[2rem] p-8 md:p-12 border border-slate-800">
                    <h1 className="text-3xl font-black text-white mb-8">Mentions Légales</h1>

                    <div className="space-y-8 text-slate-400 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-xl font-bold text-slate-200 mb-3">1. Éditeur du site</h2>
                            <p>Le site OptiLife AI est édité par :</p>
                            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                                <li><strong>Dénomination sociale :</strong> OptiLife SAS (Société fictive pour démo)</li>
                                <li><strong>Siège social :</strong> 123 Avenue de l'Innovation, 75000 Paris, France</li>
                                <li><strong>Capital social :</strong> 10 000 €</li>
                                <li><strong>RCS :</strong> Paris B 123 456 789</li>
                                <li><strong>Email :</strong> contact@optilife.ai</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-200 mb-3">2. Directeur de la publication</h2>
                            <p>Le directeur de la publication est Monsieur Admin OptiLife.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-200 mb-3">3. Hébergement</h2>
                            <p>Le site est hébergé par :</p>
                            <p className="mt-2">
                                <strong>Vercel Inc.</strong><br />
                                340 S Lemon Ave #4133<br />
                                Walnut, CA 91789<br />
                                États-Unis
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-200 mb-3">4. Propriété intellectuelle</h2>
                            <p>
                                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
                                Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalNotice;