# Direction artistique

La direction artistique (DA) vient du projet design-system d'origine (piste A « Terre ») et est reprise pour Pentimento. Les valeurs ci-dessous ont été fournies par Alexandre. **Ce qui n'est pas listé ici n'est pas décidé** : Claude Code doit poser la question, pas inventer.

## Ton

Calme, humain qui guide, jeune ; ni agressif, ni vieux, ni banal.

**Piste de travail (pas une décision)** : interface en mode jeu, peu d'écrans « ennuyeux ». À tester auprès d'utilisateurs avant de la figer (voir `product/v2.md`, « Plus tard »).

## Palette « Terre »

Couleur d'action : vert-bleu profond. Fonds vert-gris très clairs. Texte presque noir bleuté. Couleurs d'état sobres : brique (erreur), mousse (succès), ocre (attention), ardoise bleue (info).

| Rôle | Valeur |
|---|---|
| `texte` | `#1F2A2E` |
| `action` | `#3E6B6A` |
| `action` au survol | `#2E5252` |
| `surface` | `#E4EBE6` |
| texte désactivé | `#6B7678` |
| `fond` | **à fournir** |

## Couleurs d'état

Chaque état a deux versions : une **forte** (texte, icône, bordure, fond du bouton de danger) et une **teinte** (fond de bandeau).

| État | Primitifs | Forte | Teinte | forte/fond | forte/teinte | blanc/forte | texte/teinte |
|---|---|---|---|---|---|---|---|
| erreur | `brume-brique`, `brume-brique-teinte` | `#A63D2B` | `#F6E1DA` | 5,88 | 5,02 | 6,32 | 11,69 |
| succès | `brume-mousse`, `brume-mousse-teinte` | `#41692B` | `#E3EDD9` | 5,95 | 5,30 | 6,40 | 12,16 |
| attention | `brume-ocre`, `brume-ocre-teinte` | `#8A5A0B` | `#F6E8C8` | 5,50 | 4,87 | 5,92 | 12,10 |
| info | `brume-ardoise-bleue`, `brume-ardoise-bleue-teinte` | `#3D5F82` | `#E0E8F0` | 6,18 | 5,37 | 6,65 | 11,88 |

Le rattachement des primitifs aux valeurs est logique (erreur = brique, etc.) : à confirmer dans les fichiers du projet design-system d'origine.

**Jetons sémantiques à créer** : `erreur`, `erreur-fond`, `succes`, `succes-fond`, `attention`, `attention-fond`, `info`, `info-fond`.

## Composants et états

- **Info en bleu.**
- **Bandeaux** avec une fine bordure : la couleur forte à 40 % d'opacité (décor, pas de contrainte de contraste).
- **Texte courant d'un bandeau** : reste en `texte` (`#1F2A2E`). Seul le **titre** du bandeau prend la couleur forte.
- **Bouton de danger** : fond `erreur` plein, texte blanc (contraste 6,32).
- **Jamais la couleur seule** : chaque état porte une icône de forme différente. Erreur : cercle + point d'exclamation. Succès : cercle + coche. Attention : triangle + point d'exclamation. Info : cercle + « i ».
- **Focus visible** : anneau en deux temps, 3 px blanc puis 2 px `action` (`#3E6B6A`), soit 5,97 sur blanc et 5,55 sur le fond.
- **Désactivé** : fond `surface`, texte `#6B7678` (3,86). Les éléments désactivés sont exemptés du niveau AA mais gardés lisibles.
- **Survol du bouton d'action** : `#2E5252`.

## Test de contraste à écrire

Pour chaque état, quatre vérifications qui doivent toutes valoir **au moins 4,5** : forte/fond, forte/teinte, blanc/forte, texte/teinte. Soit 16 vérifications au total. Le test calcule les ratios selon la formule WCAG ; il ne se contente pas de comparer à la table ci-dessus. La vérification forte/fond attend que la valeur de `fond` soit fournie.

## Corrections faites pendant le choix (pour le journal)

- Premières candidates sous AA ou à la limite : vert de la piste B (4,29 sur surface) et vert de la piste A (4,57). Le vert de A a été assombri de `#4A7332` à `#41692B` (5,28 sur surface).
- La pêche (accent) n'est volontairement pas utilisée pour « attention » : trop claire et trop proche de l'ambre.

## Règle de mesure (héritée)

Espacements, arrondis et tailles en **multiples de 4 uniquement** (jamais 2, 3, 7…). Règle du projet design-system d'origine, à confirmer pour Pentimento.

## À fournir (ne pas inventer)

- Valeur de `fond`.
- Typographie (familles, tailles, graisses).
- Échelle d'espacement et rayons d'arrondi (multiples de 4).
- Logo ou graphie du nom, surnom court d'usage.
- Mode sombre : oui ou non.
- Détail de la direction « mode jeu ».
