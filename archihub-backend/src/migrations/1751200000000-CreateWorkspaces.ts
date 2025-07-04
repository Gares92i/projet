import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkspaces1751200000000 implements MigrationInterface {
    name = 'CreateWorkspaces1751200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Table des workspaces
        await queryRunner.query(`
            CREATE TABLE "workspaces" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "slug" character varying(100) NOT NULL,
                "logo_url" character varying(500),
                "settings" jsonb DEFAULT '{}',
                "subscription_plan" character varying(50) DEFAULT 'free',
                "subscription_status" character varying(50) DEFAULT 'active',
                "created_by_user_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_workspaces_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_workspaces" PRIMARY KEY ("id")
            )
        `);

        // Table des membres de workspace
        await queryRunner.query(`
            CREATE TABLE "workspace_members" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "workspace_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "role" character varying(50) NOT NULL DEFAULT 'member' CHECK (
                    role IN ('owner', 'admin', 'member', 'viewer')
                ),
                "permissions" jsonb DEFAULT '{}',
                "invited_by" uuid,
                "invited_at" TIMESTAMP,
                "accepted_at" TIMESTAMP,
                "status" character varying(50) DEFAULT 'pending' CHECK (
                    status IN ('pending', 'active', 'inactive', 'declined')
                ),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_workspace_members_workspace_user" UNIQUE ("workspace_id", "user_id"),
                CONSTRAINT "PK_workspace_members" PRIMARY KEY ("id")
            )
        `);

        // Table des invitations de workspace
        await queryRunner.query(`
            CREATE TABLE "workspace_invitations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "workspace_id" uuid NOT NULL,
                "email" character varying(255) NOT NULL,
                "role" character varying(50) NOT NULL DEFAULT 'member',
                "invited_by" uuid NOT NULL,
                "token" character varying(255) NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "status" character varying(50) DEFAULT 'pending' CHECK (
                    status IN ('pending', 'accepted', 'expired', 'cancelled')
                ),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_workspace_invitations_token" UNIQUE ("token"),
                CONSTRAINT "PK_workspace_invitations" PRIMARY KEY ("id")
            )
        `);

        // Ajouter workspace_id aux tables existantes
        await queryRunner.query(`
            ALTER TABLE "projects" 
            ADD COLUMN "workspace_id" uuid
        `);

        await queryRunner.query(`
            ALTER TABLE "clients" 
            ADD COLUMN "workspace_id" uuid
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD COLUMN "workspace_id" uuid
        `);

        await queryRunner.query(`
            ALTER TABLE "reports" 
            ADD COLUMN "workspace_id" uuid
        `);

        await queryRunner.query(`
            ALTER TABLE "documents" 
            ADD COLUMN "workspace_id" uuid
        `);

        // Index pour les performances
        await queryRunner.query(`
            CREATE INDEX "IDX_workspace_members_workspace_id" ON "workspace_members" ("workspace_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_workspace_members_user_id" ON "workspace_members" ("user_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_projects_workspace_id" ON "projects" ("workspace_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_clients_workspace_id" ON "clients" ("workspace_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_team_members_workspace_id" ON "team_members" ("workspace_id")
        `);

        // Contraintes de clés étrangères
        await queryRunner.query(`
            ALTER TABLE "workspace_members" 
            ADD CONSTRAINT "FK_workspace_members_workspace" 
            FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "workspace_members" 
            ADD CONSTRAINT "FK_workspace_members_user" 
            FOREIGN KEY ("user_id") REFERENCES "users_clerk"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "workspace_invitations" 
            ADD CONSTRAINT "FK_workspace_invitations_workspace" 
            FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "projects" 
            ADD CONSTRAINT "FK_projects_workspace" 
            FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "clients" 
            ADD CONSTRAINT "FK_clients_workspace" 
            FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD CONSTRAINT "FK_team_members_workspace" 
            FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "reports" 
            ADD CONSTRAINT "FK_reports_workspace" 
            FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "documents" 
            ADD CONSTRAINT "FK_documents_workspace" 
            FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les contraintes de clés étrangères
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_documents_workspace"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_reports_workspace"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_workspace"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "FK_clients_workspace"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_projects_workspace"`);
        await queryRunner.query(`ALTER TABLE "workspace_invitations" DROP CONSTRAINT "FK_workspace_invitations_workspace"`);
        await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_workspace_members_user"`);
        await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_workspace_members_workspace"`);

        // Supprimer les colonnes workspace_id
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "workspace_id"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "workspace_id"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN "workspace_id"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "workspace_id"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "workspace_id"`);

        // Supprimer les tables
        await queryRunner.query(`DROP TABLE "workspace_invitations"`);
        await queryRunner.query(`DROP TABLE "workspace_members"`);
        await queryRunner.query(`DROP TABLE "workspaces"`);
    }
} 