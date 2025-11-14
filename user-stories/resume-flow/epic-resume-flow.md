# 📘 EPIC — Création automatique d’un CV personnalisé à partir d’une offre

## 🎯 Objectif

Permettre à un utilisateur (recruteur, personne qui recommande, etc.) d’adapter automatiquement le CV de Youssef Benkirane à une offre d’emploi, via un parcours simple et guidé, qui :

1. Récupère l’offre (via URL ou formulaire manuel)
2. Extrait et structure les informations clés
3. Analyse le match entre l’offre et le profil de Youssef
4. Présente un résumé clair (tag de match, explication, points forts, points de vigilance)
5. Génère un CV moderne, structuré, au format JSON, prêt à être rendu en PDF
6. Permet de télécharger, envoyer par email ou planifier un rendez-vous.

L’expérience doit rester simple, fluide, chaleureuse, sans jargon inutile.

---

# 🧩 User Stories (avec copywriting)

## 🧡 1 — Écran d’introduction

**US1.1 — Comprendre ce que fait le flow**

> En tant qu’utilisateur,  
> je veux comprendre en une phrase ce que va faire l’outil,  
> afin de savoir pourquoi je remplis ce formulaire.

**Copywriting :**  
**Super, on va adapter mon CV à votre offre.**  
*Je vous pose quelques questions, puis je génère un CV prêt à être envoyé.*

**US1.2 — Démarrer le parcours**

> En tant qu’utilisateur,  
> je veux cliquer sur un bouton pour commencer,  
> afin de lancer le flow de génération de CV.

Bouton principal : **Commencer**

---

## 🧩 2 — Étape 1 : Entreprise + Intitulé du poste

**US2.1 — Fournir l’entreprise et le poste**

> En tant qu’utilisateur,  
> je veux indiquer le nom de l’entreprise et l’intitulé du poste,  
> afin que l’IA sache sur quelle offre le CV doit être adapté.

**Copywriting :**  
**Commençons par l’offre.**  
*Dites-moi simplement l’entreprise et le poste visé.*

Champs :  
- **Nom de l’entreprise**  
  - Placeholder : *Exemple : Alan, Airbus, Back Market…*  
- **Intitulé du poste**  
  - Placeholder : *Exemple : Product Owner*

**US2.2 — Naviguer dans le flow**

> En tant qu’utilisateur,  
> je veux pouvoir revenir en arrière ou continuer,  
> afin de corriger si besoin.

Boutons : **Précédent** / **Continuer**  

---

## 🧩 3 — Étape 2 : Qui êtes-vous ?

**US3.1 — Donner mon prénom**

> En tant qu’utilisateur,  
> je veux entrer mon prénom,  
> afin que l’expérience soit plus personnelle.

Copy :  
**Qui êtes-vous pour ce poste ?**  
*Juste pour que je sache à qui je parle 😊*

Champ :  
- Label : *Votre prénom*  
- Placeholder : *Votre prénom (promis, il reste entre nous)*

**US3.2 — Indiquer mon rôle**

> En tant qu’utilisateur,  
> je veux indiquer mon rôle par rapport au poste,  
> afin que le ton et les prochains écrans soient adaptés.

Options (boutons radios, par ex.) :  
- Je veux te recommander  
- Je recrute pour ce poste  
- Autre  
⚠️ Il n’y a **pas** d’option “Je suis le candidat”.

**US3.3 — Continuer le flow**

> En tant qu’utilisateur,  
> je veux pouvoir continuer après avoir rempli ces informations,  
> afin de passer à la suite.

Boutons : **Précédent** / **Continuer**

---

## 🧩 4 — Étape 3 : Lien vers l’annonce

**US4.1 — Coller un lien vers l’annonce**

> En tant qu’utilisateur,  
> je veux coller l’URL de l’annonce,  
> afin que l’IA puisse récupérer automatiquement les informations importantes.

**Copywriting :**  
**Avez-vous un lien vers l’annonce ?**  
*Si vous l’avez, je récupère automatiquement les infos importantes.*

Champ :  
- Label : *Lien de l’annonce*  
- Placeholder : *https://…*

**US4.2 — Choisir de remplir manuellement**

> En tant qu’utilisateur,  
> je veux pouvoir dire que je n’ai pas de lien,  
> afin de remplir l’annonce manuellement.

Lien secondaire :  
*Je n’ai pas de lien, je veux le remplir moi-même.*

---

## 🧩 5 — Loading : analyse de l’URL

**US5.1 — Écran de chargement pendant l’analyse de l’URL**

> En tant qu’utilisateur,  
> je veux voir un écran de chargement pendant que l’annonce est analysée,  
> afin de comprendre que l’outil travaille.

**Copywriting :**  
**Je m’occupe de récupérer l’annonce…**  
*Promis, ça ne prend pas longtemps.*

**Spéc UI :**  
- Remplacer les illustrations pingouins par un **loader moderne** (spinner / skeleton / animation simple).
- Le reste du style suit les maquettes (le dev suit les mockups, pas besoin d’instructions supplémentaires ici).

---

## 🧩 6 — Succès récupération de l’annonce

**US6.1 — Afficher un message de succès si l’URL a pu être exploitée**

> En tant qu’utilisateur,  
> je veux voir un message positif quand l’annonce a été récupérée,  
> afin d’être rassuré avant de continuer.

**Copywriting :**  
**J’ai trouvé les infos de l’annonce 🙌**  
*Vous pouvez vérifier et compléter ce que j’ai récupéré.*

Bouton : **Continuer**

---

## 🧩 7 — Échec récupération de l’annonce

**US7.1 — Afficher un message d’erreur et proposer un fallback**

> En tant qu’utilisateur,  
> je veux être informé si l’annonce n’a pas pu être récupérée,  
> afin de pouvoir la décrire manuellement.

**Copywriting :**  
**Je n’ai pas réussi à récupérer l’annonce.**  
*Pas grave, on va le remplir ensemble en quelques étapes.*

Bouton : **Continuer**

---

## 🧩 8 — Étape 4 : Décrire l’offre (fallback ou complément)

**US8.1 — Décrire le contexte et l’entreprise**

> En tant qu’utilisateur,  
> je veux pouvoir décrire l’offre en quelques lignes,  
> afin que l’IA comprenne le contexte du poste.

**Copywriting :**  
**Décrivez l’offre en quelques lignes.**  
*Contexte, entreprise, rôle… ce qui aide à comprendre le poste.*

---

## 🧩 9 — Étape 5 : Missions du poste

**US9.1 — Décrire les missions principales**

> En tant qu’utilisateur,  
> je veux décrire les missions principales du poste,  
> afin que l’IA sache à quoi ressemble le quotidien du job.

**Copywriting :**  
**Quelles sont les missions du poste ?**  
*Les responsabilités, le quotidien, ce que la personne va faire.*

---

## 🧩 10 — Étape 6 : Profil recherché

**US10.1 — Décrire le profil recherché**

> En tant qu’utilisateur,  
> je veux décrire le profil recherché par l’entreprise,  
> afin que l’IA puisse comparer cela au profil de Youssef.

**Copywriting :**  
**Quel profil l’entreprise recherche ?**  
*Expérience, compétences techniques, soft skills, outils…*

---

## 🧩 11 — Étape 7 : Autres informations

**US11.1 — Ajouter les informations RH / pratiques**

> En tant qu’utilisateur,  
> je veux ajouter les informations importantes (contrat, lieu, salaire, etc.),  
> afin que le contexte de l’offre soit complet.

**Copywriting :**  
**Y a-t-il d’autres infos importantes ?**  
*Contrat, salaire, lieu, rythme, avantages, contraintes…*

---

## 🧩 12 — Étape 8 : Analyse IA du match

### US12.1 — Afficher un écran de synthèse du match

> En tant qu’utilisateur,  
> je veux voir rapidement si le profil de Youssef correspond bien à l’offre,  
> afin de savoir si le CV généré aura du sens.

**Copywriting (titre + sous-titre) :**  
**Voici où je me situe pour ce poste.**  
*Je vous résume si je suis un bon match… et ce qui est à ajuster si besoin.*

---

### US12.2 — Afficher un tag de match

> En tant qu’utilisateur,  
> je veux voir une étiquette claire sur le niveau de compatibilité,  
> afin de comprendre le niveau d’alignement.

Le modèle doit choisir **1** des tags suivants :

- **On est fait pour travailler ensemble !**  
- **C’est bien parti, avec quelques ajustements 😊**  
- **Je peux m’adapter, mais il faudra clarifier certains points.**

---

### US12.3 — Afficher une explication courte

> En tant qu’utilisateur,  
> je veux lire un court texte qui explique en quoi le profil est aligné,  
> afin de comprendre le message clé sans trop de détails.

**Exemple de texte (à adapter dynamiquement) :**  
*Mon profil correspond bien à ce que vous recherchez : j’ai l’habitude de clarifier les besoins, prioriser la roadmap et travailler en proximité avec les équipes tech. J’avance vite, par petites itérations, en gardant toujours le focus sur la valeur. C’est exactement le type d’environnement où je suis efficace.*

---

### US12.4 — Afficher “Ce qui fonctionne bien” (2 bullet points max)

> En tant qu’utilisateur,  
> je veux voir en quelques points ce qui est bien aligné entre le profil et l’offre,  
> afin de comprendre les points forts principaux.

Exemple :  
- Très à l’aise avec les clients et les besoins business  
- Aisance avec n8n, Notion, automatisation, et outils web

---

### US12.5 — Afficher les “Points de vigilance” (2 bullet points max)

> En tant qu’utilisateur,  
> je veux voir les principaux écarts entre le profil et le poste,  
> afin d’anticiper les questions ou les points à adresser.

Exemple :  
- Moins d’expérience dans le secteur santé, mentionné dans l’annonce  
- Besoin de creuser l’outil Linear, spécifié comme “nice to have”

---

### US12.6 — Proposer d’accéder au CV

> En tant qu’utilisateur,  
> je veux pouvoir consulter le CV généré juste après cette synthèse,  
> afin de voir concrètement le rendu.

Bouton principal : **Voir le CV généré**  
Boutons secondaires (optionnels) :  
- Planifier un rendez-vous  
- Recevoir le CV par mail

---

## 🧩 13 — Génération du CV (JSON structuré)

### US13.1 — Générer le CV au format JSON strict

> En tant que développeur,  
> je veux recevoir le CV dans un format JSON structuré,  
> afin de pouvoir ensuite le rendre en HTML / PDF sans retravailler le texte.

**Format JSON attendu :**

```json
{
  "header": {
    "full_name": "Youssef Benkirane",
    "title": "Titre du poste adapté",
    "summary": "Résumé orienté business en 2–3 phrases"
  },
  "sections": {
    "skills_aligned": [
      "Compétence alignée 1",
      "Compétence alignée 2",
      "Compétence alignée 3"
    ],
    "experience": [
      {
        "role": "Titre du poste",
        "company": "Entreprise",
        "years": "YYYY–YYYY",
        "achievements": [
          "Accomplissement orienté business",
          "Accomplissement basé sur résultats"
        ]
      }
    ],
    "tools": [
      "Notion",
      "n8n",
      "Zapier",
      "React",
      "FastAPI",
      "AWS"
    ],
    "why_me": [
      "Phrase sur l'adéquation avec le rôle",
      "Phrase sur la manière de travailler"
    ],
    "points_of_attention": [
      "Point de vigilance 1",
      "Point de vigilance 2"
    ],
    "contact": {
      "email": "team@growth-with-flow.com",
      "website": "https://growthwithflow.com"
    }
  }
}

Objectif :
Le développeur doit se baser sur la documentation officielle pour :

Bien utiliser le structured output (JSON)

Bien appeler les functions (function calling)

Gérer le reasoning / thinking

Exploiter le URL context pour les annonces.

Références à consulter :

Gemini API docs :

https://ai.google.dev/gemini-api/docs

Structured output :

https://ai.google.dev/gemini-api/docs/structured-output

Thinking :

https://ai.google.dev/gemini-api/docs/thinking

Function calling :

https://ai.google.dev/gemini-api/docs/function-calling?example=meeting

URL context :

https://ai.google.dev/gemini-api/docs/url-context

👉 L’idée n’est pas “d’activer tout partout”, mais de :

utiliser structured output pour les JSON

utiliser url-context pour analyser l’annonce

s’inspirer de function calling pour structurer les appels IA

utiliser la doc comme référence pour un code simple, propre et à jour.

🎨 Spéc UI complémentaires

Dans tous les écrans de chargement où tu avais des pingouins :
→ les remplacer par des animations de chargement modernes (spinner / skeleton), en conservant le reste des maquettes.

Le reste (typo, arrondis, couleurs…) suit exactement les mockups Figma / existants.