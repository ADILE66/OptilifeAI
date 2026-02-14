import React from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft } from '../components/Icons';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-500 mb-8 transition-colors font-bold text-sm">
                    <IconChevronLeft className="w-4 h-4" /> Retour à l'accueil
                </Link>

                <div className="bg-slate-900 shadow-sm rounded-[2rem] p-8 md:p-12 border border-slate-800">
                    <h1 className="text-3xl font-black text-white mb-2">Politique de Confidentialité</h1>
                    <p className="text-slate-500 text-sm font-medium mb-8 uppercase tracking-widest">Dernière mise à jour : 25 Octobre 2024</p>

                    <div className="space-y-8 text-slate-400 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-xl font-bold text-slate-200 mb-3">1. Collecte des données</h2>
                            <p>Dans le cadre de l'utilisation de l'application OptiLife AI, nous sommes amenés à collecter les données suivantes :</p>
                            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                                <li>Données d'identité (Nom, Prénom, Email).</li>
                                <li>Données de santé (Poids, Taille, Âge, Sexe).</li>
                                <li>Données d'activité (Pas, Calories, Durée de sommeil).</li>
                                <li>Données alimentaires (Photos de repas, description).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-200 mb-3">2. Utilisation de l'Intelligence Artificielle</h2>
                            <p>
                                OptiLife AI utilise les modèles Gemini de Google pour analyser vos repas et fournir des recommandations.
                                Les données (textes et images) envoyées à l'IA sont anonymisées autant que possible.
                                Elles ne sont utilisées que pour fournir le service d'analyse instantanée.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-200 mb-3">3. Stockage des données</h2>
                            <p>
                                Actuellement, vos données personnelles de suivi sont stockées localement sur votre appareil (LocalStorage) pour garantir une confidentialité maximale.
                                Certaines données de compte peuvent être stockées sur nos serveurs sécurisés en France.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-200 mb-3">4. Vos droits (RGPD)</h2>
                            <p>Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :</p>
                            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                                <li>Droit d'accès et de rectification.</li>
                                <li>Droit à l'effacement (Droit à l'oubli).</li>
                                <li>Droit à la limitation du traitement.</li>
                            </ul>
                            <p className="mt-2">Pour exercer ces droits, contactez-nous à : privacy@optilife.ai ou utilisez l'option "Supprimer mon compte" dans les paramètres.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;