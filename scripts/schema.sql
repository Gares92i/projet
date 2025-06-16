-- Utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    company VARCHAR(255),
    title VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_trial BOOLEAN DEFAULT TRUE,
        trial_ends_at TIMESTAMP
    WITH
        TIME ZONE
);

-- Abonnements utilisateurs
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    plan_type VARCHAR(50) DEFAULT 'free',
    status VARCHAR(50) DEFAULT 'active',
    seats INTEGER DEFAULT 1,
    current_period_start TIMESTAMP
    WITH
        TIME ZONE,
        current_period_end TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projets
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'planning',
    progress INTEGER DEFAULT 0,
    client VARCHAR(255),
    location VARCHAR(255),
    manager VARCHAR(100),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users (id)
);

-- Équipes
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_by INTEGER REFERENCES users (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Membres d'équipe
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    team_id INTEGER REFERENCES teams (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) CHECK (
        role IN (
            'architecte',
            'chef_de_projet',
            'ingenieur',
            'designer',
            'entreprise',
            'assistant',
            'dessinateur',
            'autre'
        )
    ),
    avatar TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (
        status IN ('active', 'inactive')
    ),
    activity TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Association projet-membre d'équipe
CREATE TABLE IF NOT EXISTS project_team_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects (id) ON DELETE CASCADE,
    team_member_id INTEGER REFERENCES team_members (id) ON DELETE CASCADE,
    UNIQUE (project_id, team_member_id)
);

-- Lots de travaux
CREATE TABLE IF NOT EXISTS lots_travaux (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  numero VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  sort_order INTEGER,
  is_expanded BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Travaux
CREATE TABLE IF NOT EXISTS travaux (
    id SERIAL PRIMARY KEY,
    lot_id INTEGER REFERENCES lots_travaux (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantite DECIMAL(12, 2),
    unite VARCHAR(50),
    prix_unitaire DECIMAL(12, 2),
    tva DECIMAL(5, 2),
    start_date DATE,
    end_date DATE,
    sort_order INTEGER,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('pdf', 'img')),
    size VARCHAR(50),
    url TEXT NOT NULL,
    uploaded_by INTEGER REFERENCES users (id),
    upload_date TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Annotations
CREATE TABLE IF NOT EXISTS annotations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects (id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents (id) ON DELETE SET NULL,
    document_name VARCHAR(255),
    x DECIMAL,
    y DECIMAL,
    comment TEXT,
    resolved BOOLEAN DEFAULT false,
    resolved_date TIMESTAMP
    WITH
        TIME ZONE,
        captured_image_url TEXT,
        annotated_image_url TEXT,
        author VARCHAR(255),
        lot VARCHAR(255),
        location VARCHAR(255),
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users (id)
);

-- Rapports de visite
CREATE TABLE IF NOT EXISTS site_visit_reports (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects (id) ON DELETE CASCADE,
    report_number VARCHAR(50),
    visit_date DATE NOT NULL,
    contractor VARCHAR(255),
    in_charge VARCHAR(255),
    progress INTEGER DEFAULT 0,
    additional_details TEXT,
    weather VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users (id)
);

-- Observations
CREATE TABLE IF NOT EXISTS observations (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES site_visit_reports (id) ON DELETE CASCADE,
    item INTEGER,
    observation TEXT NOT NULL,
    description TEXT,
    photo_url TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recommandations
CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES site_visit_reports (id) ON DELETE CASCADE,
    item INTEGER,
    observation TEXT,
    action TEXT NOT NULL,
    responsible VARCHAR(255),
    status VARCHAR(50) CHECK (
        status IN (
            'pending',
            'in-progress',
            'completed',
            'on-hold'
        )
    ),
    photo_url TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Participants aux rapports
CREATE TABLE IF NOT EXISTS report_participants (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES site_visit_reports (id) ON DELETE CASCADE,
    role VARCHAR(255),
    contact VARCHAR(255),
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    presence VARCHAR(1) CHECK (
        presence IN ('P', 'R', 'A', 'E')
    ),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Progression des tâches dans les rapports
CREATE TABLE IF NOT EXISTS task_progress (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES site_visit_reports (id) ON DELETE CASCADE,
    number VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    progress INTEGER DEFAULT 0,
    color VARCHAR(50),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Photos des rapports
CREATE TABLE IF NOT EXISTS report_photos (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES site_visit_reports (id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Réserves
CREATE TABLE IF NOT EXISTS reserves (
    id SERIAL PRIMARY KEY,
    annotation_id INTEGER REFERENCES annotations (id) ON DELETE SET NULL,
    document_name VARCHAR(255),
    location VARCHAR(255),
    lot VARCHAR(255),
    description TEXT NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
    WITH
        TIME ZONE,
        image_url TEXT
);

-- Photos des réserves
CREATE TABLE IF NOT EXISTS reserve_photos (
    id SERIAL PRIMARY KEY,
    reserve_id INTEGER REFERENCES reserves (id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conversations de chat
CREATE TABLE IF NOT EXISTS chat_conversations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    team_id INTEGER REFERENCES teams (id) ON DELETE SET NULL,
    project_id INTEGER REFERENCES projects (id) ON DELETE SET NULL,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Participants aux conversations
CREATE TABLE IF NOT EXISTS chat_participants (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES chat_conversations (id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (
        type IN (
            'user',
            'client',
            'contractor',
            'team'
        )
    ),
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages de chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES chat_conversations (id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
    receiver_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);