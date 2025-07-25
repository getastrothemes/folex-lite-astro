---
# Pour mettre à jour les informations de contact comme email, téléphone, adresse, etc., merci de modifier la table `settings.contactInfo` dans `src/config/config.toml`
enable: true # Contrôle la visibilité de cette section sur toutes les pages où elle est utilisée
title: "Travaillons Ensemble"
description: |
  Nous sommes une agence digitale qui aide les entreprises à créer des expériences utilisateur immersives et engageantes

button:
  # Refer to the `sharedButton` schema in `src/sections.schema.ts` for all available configuration options (e.g., enable, label, url, hoverEffect, variant, icon, tag, rel, class, target, etc.)
  enable: true
  label: "Contactez-Nous"
  url: "/"
  # hoverEffect: "" # Optional: text-flip | creative-fill | magnetic | magnetic-text-flip
  # variant: "" # Optional: fill | outline | text | circle
  # rel: "" # Optional
  # target: "" # Optional

options:
  appearance: "light" # Options : "light" | "accent"
  centeredContent: false
---
