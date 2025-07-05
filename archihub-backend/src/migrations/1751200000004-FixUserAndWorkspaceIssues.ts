import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUserAndWorkspaceIssues1751200000004 implements MigrationInterface {
    name = 'FixUserAndWorkspaceIssues1751200000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Vérifier si la colonne clerkId existe dans users_clerk
        const clerkIdExists = await queryRunner.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.columns 
            WHERE table_name = 'users_clerk' 
            AND column_name = 'clerkId'
        `);
        
        if (clerkIdExists[0].count === '0') {
            // Ajouter la colonne clerkId si elle n'existe pas
            await queryRunner.query(`
                ALTER TABLE "users_clerk" 
                ADD COLUMN IF NOT EXISTS "clerkId" character varying
            `);
        }

        // Vérifier si la colonne clerk_user_id existe
        const clerkUserIdExists = await queryRunner.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.columns 
            WHERE table_name = 'users_clerk' 
            AND column_name = 'clerk_user_id'
        `);

        if (clerkUserIdExists[0].count === '0') {
            // Ajouter la colonne clerk_user_id si elle n'existe pas
            await queryRunner.query(`
                ALTER TABLE "users_clerk" 
                ADD COLUMN IF NOT EXISTS "clerk_user_id" character varying
            `);
        }

        // Copier les données de clerkId vers clerk_user_id si nécessaire
        await queryRunner.query(`
            UPDATE "users_clerk" 
            SET "clerk_user_id" = "clerkId" 
            WHERE "clerk_user_id" IS NULL AND "clerkId" IS NOT NULL
        `);

        // Supprimer la colonne clerkId si elle existe
        if (clerkIdExists[0].count !== '0') {
            await queryRunner.query(`
                ALTER TABLE "users_clerk" 
                DROP COLUMN "clerkId"
            `);
        }

        // ÉTAPE 1: Supprimer manuellement toutes les contraintes FK connues
        await queryRunner.query(`
            ALTER TABLE "workspace_members" DROP CONSTRAINT IF EXISTS "FK_workspace_members_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "project_team_members" DROP CONSTRAINT IF EXISTS "FK_project_team_members_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces" DROP CONSTRAINT IF EXISTS "FK_workspaces_created_by_user"
        `);
        
        // Supprimer aussi les contraintes avec des noms générés automatiquement
        await queryRunner.query(`
            ALTER TABLE "workspace_members" DROP CONSTRAINT IF EXISTS "FK_34bdb401c3d20d17e0a34d9609f"
        `);
        await queryRunner.query(`
            ALTER TABLE "project_team_members" DROP CONSTRAINT IF EXISTS "FK_project_team_members_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces" DROP CONSTRAINT IF EXISTS "FK_workspaces_created_by_user_id"
        `);

        // ÉTAPE 2: Vérifier et corriger le type de la colonne id dans users_clerk
        const usersClerkIdType = await queryRunner.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users_clerk' 
            AND column_name = 'id'
        `);

        if (usersClerkIdType.length > 0 && usersClerkIdType[0].data_type === 'uuid') {
            await queryRunner.query(`
                ALTER TABLE "users_clerk" ALTER COLUMN "id" TYPE character varying
            `);
        }

        // ÉTAPE 3: Vérifier et corriger le type de la colonne user_id dans workspace_members
        const userColumnType = await queryRunner.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'workspace_members' 
            AND column_name = 'user_id'
        `);

        if (userColumnType.length > 0 && userColumnType[0].data_type === 'uuid') {
            await queryRunner.query(`
                ALTER TABLE "workspace_members" ALTER COLUMN "user_id" TYPE character varying
            `);
        }

        // ÉTAPE 4: Vérifier et corriger le type de la colonne user_id dans project_team_members
        const projectTeamUserColumnType = await queryRunner.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'project_team_members' 
            AND column_name = 'user_id'
        `);

        if (projectTeamUserColumnType.length > 0 && projectTeamUserColumnType[0].data_type === 'uuid') {
            await queryRunner.query(`
                ALTER TABLE "project_team_members" ALTER COLUMN "user_id" TYPE character varying
            `);
        }

        // ÉTAPE 5: Vérifier et corriger le type de la colonne created_by_user_id dans workspaces
        const workspaceUserColumnType = await queryRunner.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'workspaces' 
            AND column_name = 'created_by_user_id'
        `);

        if (workspaceUserColumnType.length > 0 && workspaceUserColumnType[0].data_type === 'uuid') {
            await queryRunner.query(`
                ALTER TABLE "workspaces" ALTER COLUMN "created_by_user_id" TYPE character varying
            `);
        }

        // ÉTAPE 6: Recréer toutes les contraintes FK
        await queryRunner.query(`
            ALTER TABLE "workspace_members"
            ADD CONSTRAINT "FK_workspace_members_user"
            FOREIGN KEY ("user_id") REFERENCES "users_clerk"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "project_team_members"
            ADD CONSTRAINT "FK_project_team_members_user"
            FOREIGN KEY ("user_id") REFERENCES "users_clerk"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ADD CONSTRAINT "FK_workspaces_created_by_user"
            FOREIGN KEY ("created_by_user_id") REFERENCES "users_clerk"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert changes if needed
        // Note: This is a complex migration, manual rollback might be needed
    }
} 