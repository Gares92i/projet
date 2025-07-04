import { MigrationInterface, QueryRunner } from "typeorm";

export class FixWorkspacesAndTeams1751200000003 implements MigrationInterface {
    name = 'FixWorkspacesAndTeams1751200000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Créer la table workspaces si elle n'existe pas
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "workspaces" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "slug" character varying NOT NULL,
                "logo_url" character varying,
                "settings" jsonb NOT NULL DEFAULT '{}',
                "subscription_plan" character varying NOT NULL DEFAULT 'free',
                "subscription_status" character varying NOT NULL DEFAULT 'active',
                "created_by_user_id" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_workspaces_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_workspaces" PRIMARY KEY ("id")
            )
        `);

        // Créer la table workspace_members si elle n'existe pas
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "workspace_members" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "workspace_id" uuid NOT NULL,
                "user_id" character varying NOT NULL,
                "role" character varying NOT NULL DEFAULT 'member',
                "status" character varying NOT NULL DEFAULT 'active',
                "accepted_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_workspace_members" PRIMARY KEY ("id")
            )
        `);

        // Créer la table workspace_invitations si elle n'existe pas
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "workspace_invitations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "workspace_id" uuid NOT NULL,
                "email" character varying NOT NULL,
                "role" character varying NOT NULL DEFAULT 'member',
                "invited_by" character varying NOT NULL,
                "token" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'pending',
                "expires_at" TIMESTAMP NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_workspace_invitations_token" UNIQUE ("token"),
                CONSTRAINT "PK_workspace_invitations" PRIMARY KEY ("id")
            )
        `);

        // Corriger la table team_members si elle existe
        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD COLUMN IF NOT EXISTS "workspace_id" uuid,
            ADD COLUMN IF NOT EXISTS "user_id" character varying,
            ADD COLUMN IF NOT EXISTS "team_id" character varying,
            ADD COLUMN IF NOT EXISTS "name" character varying NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS "email" character varying,
            ADD COLUMN IF NOT EXISTS "phone" character varying,
            ADD COLUMN IF NOT EXISTS "role" character varying NOT NULL DEFAULT 'autre',
            ADD COLUMN IF NOT EXISTS "avatar" character varying,
            ADD COLUMN IF NOT EXISTS "status" character varying NOT NULL DEFAULT 'active',
            ADD COLUMN IF NOT EXISTS "activity" character varying,
            ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        `);

        // Ajouter les contraintes de clés étrangères seulement si elles n'existent pas
        const workspaceMembersConstraintExists = await queryRunner.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'FK_workspace_members_workspace' 
            AND table_name = 'workspace_members'
        `);
        
        if (workspaceMembersConstraintExists[0].count === '0') {
            await queryRunner.query(`
                ALTER TABLE "workspace_members" 
                ADD CONSTRAINT "FK_workspace_members_workspace" 
                FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            `);
        }

        const workspaceInvitationsConstraintExists = await queryRunner.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'FK_workspace_invitations_workspace' 
            AND table_name = 'workspace_invitations'
        `);
        
        if (workspaceInvitationsConstraintExists[0].count === '0') {
            await queryRunner.query(`
                ALTER TABLE "workspace_invitations" 
                ADD CONSTRAINT "FK_workspace_invitations_workspace" 
                FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            `);
        }

        const teamMembersConstraintExists = await queryRunner.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'FK_team_members_workspace' 
            AND table_name = 'team_members'
        `);
        
        if (teamMembersConstraintExists[0].count === '0') {
            await queryRunner.query(`
                ALTER TABLE "team_members" 
                ADD CONSTRAINT "FK_team_members_workspace" 
                FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            `);
        }

        // Créer les index pour améliorer les performances
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_workspace_members_workspace_id" ON "workspace_members" ("workspace_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_workspace_members_user_id" ON "workspace_members" ("user_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_team_members_workspace_id" ON "team_members" ("workspace_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les index
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_team_members_workspace_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_workspace_members_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_workspace_members_workspace_id"`);

        // Supprimer les contraintes de clés étrangères
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "FK_team_members_workspace"`);
        await queryRunner.query(`ALTER TABLE "workspace_invitations" DROP CONSTRAINT IF EXISTS "FK_workspace_invitations_workspace"`);
        await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT IF EXISTS "FK_workspace_members_workspace"`);

        // Supprimer les colonnes ajoutées à team_members
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN IF EXISTS "updated_at"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN IF EXISTS "created_at"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN IF EXISTS "activity"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN IF EXISTS "status"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN IF EXISTS "avatar"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN IF EXISTS "role"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN IF EXISTS "phone"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN IF EXISTS "email"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN IF EXISTS "name"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN IF EXISTS "team_id"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN IF EXISTS "user_id"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN IF EXISTS "workspace_id"`);

        // Supprimer les tables
        await queryRunner.query(`DROP TABLE IF EXISTS "workspace_invitations"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "workspace_members"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "workspaces"`);
    }
} 