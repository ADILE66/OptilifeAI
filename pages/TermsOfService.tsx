import React from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft, IconShield } from '../components/Icons';

const TermsOfService: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-500 mb-8 transition-colors font-bold text-sm">
                    <IconChevronLeft className="w-4 h-4" /> Retour à l'accueil
                </Link>

                <div className="bg-slate-900 shadow-sm rounded-[2rem] p-8 md:p-12 border border-slate-800">
                    <h1 className="text-3xl font-black text-white mb-8">Conditions Générales d'Utilisation</h1>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8 flex gap-4 items-start">
                        <IconShield className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-amber-400 mb-1">Avertissement Médical Important</h3>
                            <p className="text-sm text-amber-200/80 leading-relaxed">
                                OptiLife AI est une application de bien-être et de coaching. <strong>Ce n'est pas un dispositif médical.</strong>
                                Les conseils fournis par l'IA ne remplacent en aucun cas l'avis d'un médecin, d'un nutritionniste ou d'un professionnel de santé.
                                En cas de doute sur votre santé, consultez immédiatement un spécialiste.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8 text-slate-400 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-xl font-bold text-slate-200 mb-3">1. Acceptation des conditions</h2>
                            <p>
                                L'accès et l'utilisation de l'application OptiLife AI impliquent l'acceptation sans réserve des présentes Conditions Générales d'Utilisation.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-200 mb-3">2. Description du service</h2>
                            <p>
                                OptiLife AI fournit des outils de suivi nutritionnel, d'hydratation, d'activité physique et de sommeil assistés par intelligence artificielle.
                                Certaines fonctionnalités nécessitent un abonnement payant ("Pro").
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-200 mb-3">3. Abonnements et Paiements</h2>
                            <p>
                                Les paiements sont sécurisés et traités par notre partenaire Stripe. L'abonnement est renouvelé automatiquement sauf résiliation 24h avant l'échéance.
                                Aucun remboursement n'est effectué pour la période en cours.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-200 mb-3">4. Responsabilité</h2>
                            <p>
                                OptiLife AI ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation de l'application.
                                L'utilisateur est seul responsable de l'interprétation des données fournies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-200 mb-3">5. Modification des CGU</h2>
                            <p>
                                Nous nous réservons le droit de modifier les présentes conditions à tout moment. L'utilisateur sera notifié des changements majeurs.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;