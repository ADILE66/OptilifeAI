# OptiLife AI - Coaching Santé de Nouvelle Génération 🚀

OptiLife AI est une application SaaS de santé holistique pilotée par l'intelligence artificielle, conçue pour transformer votre bien-être quotidien à travers 5 piliers fondamentaux : Nutrition, Hydratation, Mouvement, Jeûne et Sommeil.

![OptiLife AI Banner](https://images.unsplash.com/photo-1541781777621-4018301a7041?auto=format&fit=crop&q=80&w=1200)

## 🌟 Points Forts

- **Approche Holistique** : Synchronisation intelligente des 5 modules pour une vision à 360° de votre santé.
- **Intelligence Artificielle** : Propulsé par Google Gemini pour l'analyse visuelle des repas et le coaching personnalisé.
- **Multilingue** : Support complet du Français, Anglais et Espagnol avec bascule dynamique.
- **Expérience Premium** : Interface sombre moderne, fluide et optimisée pour l'utilisateur.

## 🛠 Modules Inclus

1.  **🍎 Nutrition Consciente** : Analyse de vos repas par photo, détection des macros et calories.
2.  **💧 Hydratation Vitale** : Suivi intelligent adapté à votre activité et à votre environnement.
3.  **🏃 Mouvement & GPS** : Tracé de vos activités physiques et calcul de l'impact calorique réel.
4.  **⏳ Jeûne Rythmique** : Maîtrise des cycles métaboliques (16:8, OMAD, etc.).
5.  **🌙 Sommeil & Récup** : Analyse de la qualité de vos nuits en corrélation avec vos habitudes de vie.

## 💻 Stack Technique

- **Frontend** : React 18, TypeScript, Vite.
- **Styling** : Tailwind CSS (Dark Mode par défaut, Premium UI).
- **Internationalisation** : Système i18n personnalisé (FR, EN, ES).
- **IA** : Intégration Google Gemini Pro Vision/Flash.
- **Routing** : React Router DOM.

## 🚀 Installation & Lancement

### Prérequis
- Node.js (Version 18+)
- npm ou yarn

### Étapes
1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/ADILE66/OptiLifeAI.git
   cd OptiLifeAI
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Variables d'environnement**
   Créez un fichier `.env` à la racine et ajoutez votre clé API :
   ```env
   VITE_GEMINI_API_KEY=votre_cle_ici
   ```

4. **Lancer en mode développement**
   ```bash
   npm run dev
   ```

## 🌍 Internationalisation

L'application supporte actuellement 3 langues :
- 🇫🇷 **Français** : Langue par défaut.
- 🇬🇧 **English** : Traduction intégrale.
- 🇪🇸 **Español** : Traduction intégrale.

Le choix de la langue est persisté via le `localStorage`.

## 📸 Aperçu

La page d'accueil (Landing Page) présente chaque module de manière dynamique avec des visuels de haute qualité et un accès direct aux versions multilingues.

---

© 2024 OptiLife AI. Développé avec passion pour votre santé.
