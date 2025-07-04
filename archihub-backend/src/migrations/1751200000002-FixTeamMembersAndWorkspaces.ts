import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTeamMembersAndWorkspaces1751200000002 implements MigrationInterface {
    name = 'FixTeamMembersAndWorkspaces1751200000002'

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

        // Créer la table team_members si elle n'existe pas
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "team_members" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" character varying,
                "team_id" character varying,
                "name" character varying NOT NULL,
                "email" character varying,
                "phone" character varying,
                "role" character varying NOT NULL DEFAULT 'autre',
                "avatar" character varying,
                "status" character varying NOT NULL DEFAULT 'active',
                "activity" character varying,
                "workspace_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_team_members" PRIMARY KEY ("id")
            )
        `);

        // Ajouter les contraintes de clé étrangère
        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD CONSTRAINT "FK_team_members_workspace_id" 
            FOREIGN KEY ("workspace_id") 
            REFERENCES "workspaces"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Créer les index
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_team_members_workspace_id" 
            ON "team_members" ("workspace_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_workspaces_created_by_user_id" 
            ON "workspaces" ("created_by_user_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les contraintes de clé étrangère
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_workspace_id"`);
        
        // Supprimer les tables
        await queryRunner.query(`DROP TABLE "team_members"`);
        await queryRunner.query(`DROP TABLE "workspaces"`);
    }
} 