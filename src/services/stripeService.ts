/**
 * SERVICE STRIPE - CONFIGURATION DE PRODUCTION
 * 
 * Guide pour le déploiement :
 * 1. Créez un lien de paiement sur votre tableau de bord Stripe.
 * 2. Copiez le lien (ex: https://buy.stripe.com/abc123xyz).
 * 3. Collez-le ci-dessous.
 */

export const handleCheckout = async (): Promise<void> => {
  // REMPLACEZ PAR VOTRE LIEN RÉEL LORS DU DÉPLOIEMENT
  const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/votre_lien_reel_ici"; 

  if (STRIPE_PAYMENT_LINK.includes("votre_lien_reel")) {
    alert("Configuration requise : Veuillez configurer votre lien Stripe dans services/stripeService.ts pour activer les paiements Pro.");
    return;
  }

  // Redirection vers l'interface de paiement Stripe
  window.location.href = STRIPE_PAYMENT_LINK;
};

/**
 * Vérifie si l'URL contient les paramètres de succès de Stripe
 */
export const checkPaymentStatus = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('success') === 'true';
};