CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users_clerk (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    created_by_user_id UUID REFERENCES users_clerk(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_clerk_id UUID REFERENCES users_clerk(id) ON DELETE SET NULL, -- Link to Clerk user
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL, -- Team member's own email, might differ from Clerk email if it's a generic member
    role VARCHAR(100), -- e.g., 'architecte', 'chef_de_projet'
    status VARCHAR(50) DEFAULT 'active', -- e.g., 'active', 'inactive'
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    location TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50), -- e.g., 'planning', 'design', 'construction', 'completed'
    progress INTEGER DEFAULT 0, -- Percentage
    project_type VARCHAR(100), -- e.g., 'apartment', 'house', 'office'
    project_area NUMERIC(10, 2), -- Square meters
    room_count INTEGER,
    image_url TEXT,
    created_by_user_id UUID REFERENCES users_clerk(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_team_members (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    role_in_project VARCHAR(100), -- Specific role for this project
    PRIMARY KEY (project_id, team_member_id)
);

CREATE TABLE descriptifs ( -- Corresponds to LotTravaux / DescriptifDetailItem
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    lot_name VARCHAR(255) NOT NULL, -- e.g., "GROS OEUVRE", "ELECTRICITE"
    description TEXT,
    status VARCHAR(50), -- e.g., 'pending', 'in_progress', 'completed'
    budget NUMERIC(12, 2),
    travaux JSONB, -- Array of { description: string, unit: string, quantity: number, unit_price: number, total_price: number, details?: string }
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports ( -- Corresponds to SiteVisitReport
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    report_number VARCHAR(100) UNIQUE,
    visit_date TIMESTAMPTZ NOT NULL,
    contractor VARCHAR(255),
    in_charge VARCHAR(255), -- Person in charge for the visit
    progress INTEGER, -- Overall progress percentage for this report
    weather TEXT,
    participants JSONB, -- Array of { contact: string, email?: string, phone?: string, role?: string, presence?: string }
    observations JSONB, -- Array of { id: string, observation: string, description: string, photos?: string[], lot?: string, status?: string }
    recommendations JSONB, -- Array of { id: string, observation: string, action: string, responsible: string, deadline?: string, status?: string }
    reserves JSONB, -- Array of { id: string, description: string, lot?: string, location?: string, photos?: string[], status?: string, resolvedAt?: string }
    additional_details TEXT,
    created_by_user_id UUID REFERENCES users_clerk(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    description TEXT,
    taken_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents ( -- For general project documents, plans, PDFs that can be annotated
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50), -- e.g., 'pdf', 'png', 'jpg'
    storage_url TEXT NOT NULL, -- URL from cloud storage
    uploaded_by_user_id UUID REFERENCES users_clerk(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    created_by_user_id UUID REFERENCES users_clerk(id) ON DELETE SET NULL,
    position JSONB NOT NULL, -- { x: number, y: number, page?: number }
    comment TEXT,
    type VARCHAR(50) DEFAULT 'comment', -- e.g., 'comment', 'measurement', 'issue'
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by_user_id UUID REFERENCES users_clerk(id) ON DELETE SET NULL,
    photos JSONB, -- Array of URLs for photos attached to this annotation
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for foreign keys and commonly queried columns
CREATE INDEX idx_users_clerk_clerk_user_id ON users_clerk(clerk_user_id);
CREATE INDEX idx_clients_created_by ON clients(created_by_user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_created_by ON projects(created_by_user_id);
CREATE INDEX idx_project_team_members_project_id ON project_team_members(project_id);
CREATE INDEX idx_project_team_members_team_member_id ON project_team_members(team_member_id);
CREATE INDEX idx_descriptifs_project_id ON descriptifs(project_id);
CREATE INDEX idx_reports_project_id ON reports(project_id);
CREATE INDEX idx_report_photos_report_id ON report_photos(report_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_annotations_document_id ON annotations(document_id);
CREATE INDEX idx_annotations_created_by ON annotations(created_by_user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatically updating updated_at
CREATE TRIGGER set_timestamp_users_clerk
BEFORE UPDATE ON users_clerk
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_clients
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_team_members
BEFORE UPDATE ON team_members
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_projects
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_descriptifs
BEFORE UPDATE ON descriptifs
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_reports
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_documents
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_annotations
BEFORE UPDATE ON annotations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
