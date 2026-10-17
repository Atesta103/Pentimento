# Pentimento : ERD du MVP

Modèle de données du MVP (PostgreSQL). Conventions : tables au pluriel, `snake_case`, `_id` = clé étrangère, `_at` = instant (`timestamptz`), `_on` = jour (`date`), `_by_id` = utilisateur auteur d'une action, `needs_` = booléen.

```mermaid
erDiagram
    institutions ||--o{ users : "has"
    institutions ||--o{ projects : "hosts"
    institutions |o--o{ templates : "owns"
    users ||--o{ projects : "creates"
    projects ||--o{ groups : "has"
    projects ||--o{ project_members : "has"
    users ||--o{ project_members : "joins as"
    groups |o--o{ project_members : "groups"
    projects ||--o{ deliverables : "defines"
    templates |o--o{ deliverables : "suggests"
    deliverables ||--o{ assignments : "is assigned as"
    groups ||--o{ assignments : "works on"
    users |o--o{ assignments : "approves"
    assignments ||--o{ submissions : "receives"
    users ||--o{ submissions : "submits"
    submissions ||--o{ comments : "gets"
    users ||--o{ comments : "writes"
    users |o--o{ comments : "resolves"
    assignments ||--o{ status_changes : "logs"
    submissions |o--o{ status_changes : "triggers"
    users ||--o{ status_changes : "makes"
    users ||--o{ notifications : "receives"

    institutions {
        uuid id PK
        text name
        text slug UK
        timestamptz created_at
    }

    users {
        uuid id PK
        uuid institution_id FK
        text email UK
        text first_name
        text last_name
        text locale
        timestamptz email_verified_at "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    projects {
        uuid id PK
        uuid institution_id FK
        uuid created_by_id FK
        text title
        text brief
        text objectives "nullable"
        date starts_on
        date ends_on
        project_status status
        text invite_code UK
        timestamptz invite_expires_at "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    groups {
        uuid id PK
        uuid project_id FK
        text name
        timestamptz created_at
    }

    project_members {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        uuid group_id FK "nullable"
        member_role role
        timestamptz joined_at
    }

    templates {
        uuid id PK
        uuid institution_id FK "nullable"
        text title
        text description
        text category
        text locale
        text storage_key
        text original_filename
        timestamptz created_at
    }

    deliverables {
        uuid id PK
        uuid project_id FK
        uuid template_id FK "nullable"
        text title
        text instructions
        timestamptz due_at
        integer sort_order
        timestamptz created_at
        timestamptz updated_at
    }

    assignments {
        uuid id PK
        uuid deliverable_id FK
        uuid group_id FK
        assignment_status status
        timestamptz last_activity_at
        uuid approved_by_id FK "nullable"
        timestamptz approved_at "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    submissions {
        uuid id PK
        uuid assignment_id FK
        uuid submitted_by_id FK
        integer version_number
        text note "nullable"
        text storage_key
        text original_filename
        text mime_type
        integer size_bytes
        text checksum_sha256
        timestamptz submitted_at
    }

    comments {
        uuid id PK
        uuid submission_id FK
        uuid author_id FK
        text body
        boolean needs_fix "default false"
        uuid resolved_by_id FK "nullable"
        timestamptz resolved_at "nullable"
        jsonb anchor "nullable, reserve V2"
        timestamptz created_at
        timestamptz edited_at "nullable"
    }

    status_changes {
        uuid id PK
        uuid assignment_id FK
        uuid submission_id FK "nullable"
        uuid changed_by_id FK
        assignment_status from_status
        assignment_status to_status
        text note "nullable"
        timestamptz changed_at
    }

    notifications {
        uuid id PK
        uuid user_id FK
        notification_type type
        notification_channel channel
        jsonb payload
        integer attempt_count "default 0"
        timestamptz created_at
        timestamptz sent_at "nullable"
        timestamptz read_at "nullable"
    }
```

## Comment lire le diagramme

Notation « patte de corbeau » (crow's foot), à lire du côté de la table jusqu'au symbole :

| Symbole | Signification |
|---|---|
| `\|\|` | exactement un |
| `\|o` | zéro ou un (la clé étrangère est nullable) |
| `o{` | zéro ou plusieurs |

Exemple : `projects ||--o{ groups` se lit « un projet a zéro ou plusieurs groupes, et un groupe appartient à exactement un projet ».

## Types énumérés

| Type | Valeurs |
|---|---|
| `project_status` | `draft`, `active`, `archived` |
| `member_role` | `teacher`, `student` |
| `assignment_status` | `to_submit`, `awaiting_review`, `changes_requested`, `approved` |
| `notification_type` | `submission_received`, `changes_requested`, `approved` |
| `notification_channel` | `email`, `in_app` |

## Contraintes que le diagramme ne montre pas

**Unicités composées**

- `project_members` : (`project_id`, `user_id`)
- `assignments` : (`deliverable_id`, `group_id`)
- `submissions` : (`assignment_id`, `version_number`)

**Cohérence entre tables** : le `group_id` d'un `project_members` doit appartenir au même projet que lui (clé composite ou contrôle dans la couche service).

**Immuabilité** : `submissions` et `status_changes` ne reçoivent jamais d'`UPDATE` ni de `DELETE`.

**Suppression** : pas de `ON DELETE CASCADE` sur ce qui contient du travail d'étudiant ; les projets s'archivent.

**Index prévus** : `project_members(user_id)`, `assignments(group_id, status)`, `assignments(status, last_activity_at)`, `submissions(assignment_id)`, `comments(submission_id)`.

## Prévu pour la V2, non construit

`institution_id` partout (SSO, facturation), `comments.anchor` (annotations), `notifications.channel = in_app`, `status_changes` (statistiques), `users.locale` (langues), versions comme entité à part (comparaison visuelle).
