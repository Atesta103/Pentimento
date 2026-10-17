# Pentimento : kit de démarrage

Ce dossier contient tout ce qui a été décidé pour Pentimento (idée, nom, direction artistique, périmètre MVP et V2, base de données, règles d'accès, architecture) et le plan que Claude Code doit suivre pour en faire un début de projet.

**Il ne contient pas de code.** Le code est écrit par Claude Code, phase par phase, selon `BOOTSTRAP.md`.

## Contenu

```
CLAUDE.md                     règles permanentes pour Claude Code (lu automatiquement)
BOOTSTRAP.md                  plan de démarrage en 9 phases, avec critères d'acceptation
design/
  tokens.json                 jetons de design connus (couleurs, états, focus)
docs/
  vision.md                   problème, hypothèse, utilisateurs, risques
  brand/
    naming.md                 le nom Pentimento : démarche, vérifications, risques
    design-direction.md       direction artistique « Terre » et règles d'accessibilité
  product/
    user-flow.md              parcours étudiant et enseignant (7 étapes), avec le lien FigJam
    mvp.md                    fonctionnalités du MVP (identifiants, dépendances, critères)
    v2.md                     fonctionnalités de la V2 par vagues
  data/
    erd.md                    schéma de base de données (diagramme Mermaid, 12 tables)
    schema-notes.md           conventions, énumérations, contraintes, seed
  security/
    access-rules.md           qui peut faire quoi (matrice) et règles transversales
  architecture/
    architecture.md           pile technique, 5 couches, dossiers, dépôt de fichiers, tests
  decisions/
    journal.md                journal des décisions D-001 à D-007
```

## Comment l'utiliser

1. Crée un nouveau dépôt (par exemple `pentimento`) et dézippe ce dossier **à sa racine**.
2. Fais toi-même le premier commit (`git add .`, puis un message du type `chore: add project kickoff docs`).
3. Lance Claude Code dans le dossier. Il lit `CLAUDE.md` tout seul.
4. Colle ce prompt de départ :

```
Lis CLAUDE.md puis BOOTSTRAP.md. Exécute uniquement la phase 0 :
restitue ce que tu as compris, liste les trous et les risques, et
pose-moi les questions de la section « Décisions à prendre ».
N'écris aucun code et ne fais aucun commit.
```

5. Une fois la phase 0 validée, demande la phase suivante. Claude Code s'arrête à chaque checkpoint et te propose un message de commit : c'est toi qui commits.

## Ce qui manque encore

- **Direction artistique incomplète.** Les couleurs d'action, de texte, de surface et d'état sont connues. Il manque la couleur de fond, la typographie, le logo, l'échelle d'espacement et la décision sur un mode sombre. Claude Code doit te les demander, pas les inventer.
- **Lien avec la certification RNCP** : à préciser dans `docs/decisions/journal.md` (le projet remplace-t-il le projet actuel ou vient-il en plus ?).
- **Vérifications du nom** : TMview (EUIPO), domaines et test avec 5 personnes restent à faire.
- **Besoin non encore validé** : 2 ou 3 entretiens (étudiants et un enseignant) sont prévus.
