import { MigrationInterface, QueryRunner } from "typeorm";

export class AgencyRefactor1751300000000 implements MigrationInterface {
    name = 'AgencyRefactor1751300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Supprimer les anciennes tables liées à workspace
        await queryRunner.query(`DROP TABLE IF EXISTS "workspace_invitations" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "workspace_members" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "workspaces" CASCADE`);

        // 2. Créer la table settings (company_settings)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "company_settings" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "owner_id" uuid NOT NULL,
                "company_name" varchar(255) NOT NULL,
                "address" varchar(255),
                "logo_url" varchar(255),
                "subscription_plan" varchar(50),
                "subscription_status" varchar(50),
                "max_members_allowed" integer,
                "default_user_role" varchar(50),
                "branding" jsonb,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                CONSTRAINT "FK_company_settings_owner" FOREIGN KEY ("owner_id") REFERENCES "users_clerk"("id") ON DELETE CASCADE
            )
        `);

        // 3. Créer la table agency_members
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "agency_members" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "owner_id" uuid NOT NULL,
                "role" varchar(50) NOT NULL DEFAULT 'member',
                "status" varchar(20) NOT NULL DEFAULT 'active',
                "created_at" TIMESTAMP DEFAULT now(),
                CONSTRAINT "FK_agency_members_user" FOREIGN KEY ("user_id") REFERENCES "users_clerk"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_agency_members_owner" FOREIGN KEY ("owner_id") REFERENCES "users_clerk"("id") ON DELETE CASCADE
            )
        `);

        // 4. Modifier les tables existantes : remplacer workspace_id par owner_id
        // projects
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "FK_projects_workspace"`);
        await queryRunner.query(`ALTER TABLE "projects" RENAME COLUMN "workspace_id" TO "owner_id"`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_projects_owner" FOREIGN KEY ("owner_id") REFERENCES "users_clerk"("id") ON DELETE SET NULL`);

        // clients
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "FK_clients_workspace"`);
        await queryRunner.query(`ALTER TABLE "clients" RENAME COLUMN "workspace_id" TO "owner_id"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "FK_clients_owner" FOREIGN KEY ("owner_id") REFERENCES "users_clerk"("id") ON DELETE SET NULL`);

        // team_members
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "FK_team_members_workspace"`);
        await queryRunner.query(`ALTER TABLE "team_members" RENAME COLUMN "workspace_id" TO "owner_id"`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_owner" FOREIGN KEY ("owner_id") REFERENCES "users_clerk"("id") ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Inverse des opérations ci-dessus (optionnel, à détailler si besoin)
    }
} 