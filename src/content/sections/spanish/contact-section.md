---
enable: true # Contrôle la visibilité de cette section sur toutes les pages où elle est utilisée
title: "Un projet en tête ?"
description: "Super ! Nous sommes impatients de vous écouter et de commencer quelque chose"

# image: "/images/about-us/about-one.jpg"
# imagePosition: "left" # Choisissez entre "left" ou "right"

map:
  enable: true
  position: "right" # Choisissez entre "left" ou "right"
  title: "Carte de New Work City"
  url: https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=fr&amp;q=1%20Grafton%20Street,%20Dublin,%20Ireland+(Mon%20Nom%20d'Entreprise)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed

# contactInformation:
#   - title: "Siège social"
#     icon: "/images/icons/svg/location-filled.svg"
#     description: "27 Division St, New York, NY 10002, USA"
#     button:
#       # Refer to the `sharedButton` schema in `src/sections.schema.ts` for all available configuration options (e.g., enable, label, url, hoverEffect, variant, icon, tag, rel, class, target, etc.)
#       enable: true
#       label: "Obtenir l'itinéraire"
#       url: "/"
#       # hoverEffect: "" # Optional: text-flip | creative-fill | magnetic | magnetic-text-flip
#       # variant: "" # Optional: fill | outline | text | circle
#       # rel: "" # Optional
#       # target: "" # Optional
#
#   - title: "Adresse e-mail"
#     icon: "/images/icons/svg/message-filled.svg"
#     description: |
#       folex.agency@mail.com
#       folex.agency@support.com
#     button:
#       # Refer to the `sharedButton` schema in `src/sections.schema.ts` for all available configuration options (e.g., enable, label, url, hoverEffect, variant, icon, tag, rel, class, target, etc.)
#       enable: true
#       label: "Envoyer un message"
#       url: "mailto:folex.agency@m
#       # hoverEffect: "" # Optional: text-flip | creative-fill | magnetic | magnetic-text-flip
#       # variant: "" # Optional: fill | outline | text | circle
#       # rel: "" # Optional
#       # target: "" # Optionalail.com"
#
#   - title: "Numéro de téléphone"
#     icon: "/images/icons/svg/phone-filled.svg"
#     description: |
#       +1 800 123 654 987
#       +1 800 223 984 002
#     button:
#       # Refer to the `sharedButton` schema in `src/sections.schema.ts` for all available configuration options (e.g., enable, label, url, hoverEffect, variant, icon, tag, rel, class, target, etc.)
#       enable: true
#       label: "Appeler à tout moment"
#       url: "tel:+1800123654987"
#       # hoverEffect: "" # Optional: text-flip | creative-fill | magnetic | magnetic-text-flip
#       # variant: "" # Optional: fill | outline | text | circle
#       # rel: "" # Optional
#       # target: "" # Optional

# Vérifiez le fichier config.toml pour les paramètres liés au formulaire
# ce formulaire est aussi utilisé dans le pied de page du portfolio personnel
form:
  emailSubject: "Nouvelle soumission de formulaire depuis le site folex" # Sujet personnalisé de l’email (valable à chaque soumission)
  submitButton:
    label: "ENVOYER LE MESSAGE"
  # Cette note apparaîtra à la fin du formulaire
  # note: |
  #   Vos données sont en sécurité avec nous. Nous respectons votre vie privée et ne partageons jamais vos informations. <br /> Lisez notre [Politique de confidentialité](/privacy-policy/).
  inputs:
    - label: ""
      placeholder: "Nom complet *"
      name: "Nom complet" # Indique sous quel nom vous voulez recevoir cette donnée
      required: true
      halfWidth: true
      defaultValue: ""
    - label: ""
      placeholder: "Adresse e-mail *"
      name: "Adresse e-mail" # Indique sous quel nom vous voulez recevoir cette donnée
      required: true
      type: "email"
      halfWidth: true
      defaultValue: ""
    - label: ""
      placeholder: "Sujet *"
      name: "Sujet" # Indique sous quel nom vous voulez recevoir cette donnée
      required: false
      halfWidth: true
      dropdown:
        type: "" # select | search - par défaut select
        search: # si type est search, il fonctionnera
          placeholder: ""
        items:
          - label: "Demande générale"
            value: "Demande générale"
            selected: false
          - label: "Opportunité de partenariat"
            value: "Opportunité de partenariat"
            selected: false
          - label: "Opportunité d'investissement"
            value: "Opportunité d'investissement"
            selected: false
    - label: ""
      placeholder: "Sujet avec recherche *"
      name: "Sujet avec recherche" # Indique sous quel nom vous voulez recevoir cette donnée
      required: false
      halfWidth: true
      dropdown:
        type: "search" # select | search - par défaut select
        search:
          placeholder: "Sujet avec recherche"
        items:
          - label: "Demande générale"
            value: "Demande générale"
            selected: false
          - label: "Opportunité de partenariat"
            value: "Opportunité de partenariat"
            selected: false
          - label: "Opportunité de carrière"
            value: "Opportunité de carrière"
            selected: false
          - label: "Opportunité d'investissement"
            value: "Opportunité d'investissement"
            selected: false
          - label: "Demande média"
            value: "Demande média"
            selected: false
    - label: ""
      tag: "textarea"
      defaultValue: ""
      rows: "2"
      placeholder: "Comment pouvons-nous vous aider *"
      name: "Message" # Indique sous quel nom vous voulez recevoir cette donnée
      required: true
      halfWidth: false
    - label: "Recherche Google"
      checked: false
      name: "Source Utilisateur"
      required: true
      groupLabel: "Comment avez-vous entendu parler de nous ?"
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "Réseaux sociaux"
      name: "Source Utilisateur"
      required: true
      groupLabel: ""
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""
    # - label: "Parrainage"
    #   name: "Source Utilisateur"
    #   required: true
    #   groupLabel: ""
    #   group: "source"
    #   type: "radio"
    #   halfWidth: true
    #   defaultValue: ""
    # - label: "Autre"
    #   name: "Source Utilisateur"
    #   required: true
    #   groupLabel: ""
    #   group: "source"
    #   type: "radio"
    #   halfWidth: true
    #   defaultValue: ""
    - label: "J'accepte les termes et conditions ainsi que la [politique de confidentialité](/)."
      id: "privacy-policy"
      name: "Consentement confidentialité"
      value: "Accepté"
      checked: false
      required: true
      type: "checkbox"
      halfWidth: false
      defaultValue: ""
    - note: success
      parentClass: "hidden text-sm message success"
      content: "Nous avons bien reçu votre message ! Nous vous répondrons dès que possible."
    - note: deprecated
      parentClass: "hidden text-sm message error"
      content: "Une erreur est survenue ! Veuillez utiliser cet e-mail - [folex-astro-theme@gmail.com](mailto:folex-astro-theme@gmail.com) pour soumettre un ticket !"
---
