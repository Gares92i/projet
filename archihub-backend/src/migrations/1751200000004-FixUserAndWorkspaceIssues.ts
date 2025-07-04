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
                ADD COLUMN "clerkId" character varying
            `);
        }

        // Vérifier si la colonne clerk_user_id existe dans users_clerk
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
                ADD COLUMN "clerk_user_id" character varying
            `);
        }

        // Mettre à jour les données existantes pour copier clerkId vers clerk_user_id
        await queryRunner.query(`
            UPDATE "users_clerk" 
            SET "clerk_user_id" = "clerkId" 
            WHERE "clerk_user_id" IS NULL AND "clerkId" IS NOT NULL
        `);

        // Supprimer la colonne clerkId si elle existe encore
        const clerkIdStillExists = await queryRunner.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.columns 
            WHERE table_name = 'users_clerk' 
            AND column_name = 'clerkId'
        `);
        
        if (clerkIdStillExists[0].count === '1') {
            await queryRunner.query(`
                ALTER TABLE "users_clerk" 
                DROP COLUMN "clerkId"
            `);
        }

        // Vérifier si la colonne user_id dans workspace_members est de type UUID
        const userIdColumnType = await queryRunner.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'workspace_members' 
            AND column_name = 'user_id'
        `);
        
        if (userIdColumnType.length > 0 && userIdColumnType[0].data_type === 'uuid') {
            // Si user_id est de type UUID, le changer en character varying
            await queryRunner.query(`
                ALTER TABLE "workspace_members" 
                ALTER COLUMN "user_id" TYPE character varying
            `);
        }

        // Vérifier si la colonne user_id dans team_members est de type UUID
        const teamUserIdColumnType = await queryRunner.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'team_members' 
            AND column_name = 'user_id'
        `);
        
        if (teamUserIdColumnType.length > 0 && teamUserIdColumnType[0].data_type === 'uuid') {
            // Si user_id est de type UUID, le changer en character varying
            await queryRunner.query(`
                ALTER TABLE "team_members" 
                ALTER COLUMN "user_id" TYPE character varying
            `);
        }

        // Vérifier si la colonne created_by_user_id dans workspaces est de type UUID
        const workspaceUserIdColumnType = await queryRunner.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'workspaces' 
            AND column_name = 'created_by_user_id'
        `);
        
        if (workspaceUserIdColumnType.length > 0 && workspaceUserIdColumnType[0].data_type === 'uuid') {
            // Si created_by_user_id est de type UUID, le changer en character varying
            await queryRunner.query(`
                ALTER TABLE "workspaces" 
                ALTER COLUMN "created_by_user_id" TYPE character varying
            `);
        }

        // Vérifier si la colonne invited_by dans workspace_invitations est de type UUID
        const invitationUserIdColumnType = await queryRunner.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'workspace_invitations' 
            AND column_name = 'invited_by'
        `);
        
        if (invitationUserIdColumnType.length > 0 && invitationUserIdColumnType[0].data_type === 'uuid') {
            // Si invited_by est de type UUID, le changer en character varying
            await queryRunner.query(`
                ALTER TABLE "workspace_invitations" 
                ALTER COLUMN "invited_by" TYPE character varying
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir les changements de type de colonnes
        await queryRunner.query(`
            ALTER TABLE "workspace_members" 
            ALTER COLUMN "user_id" TYPE uuid USING user_id::uuid
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ALTER COLUMN "user_id" TYPE uuid USING user_id::uuid
        `);

        await queryRunner.query(`
            ALTER TABLE "workspaces" 
            ALTER COLUMN "created_by_user_id" TYPE uuid USING created_by_user_id::uuid
        `);

        await queryRunner.query(`
            ALTER TABLE "workspace_invitations" 
            ALTER COLUMN "invited_by" TYPE uuid USING invited_by::uuid
        `);

        // Ajouter la colonne clerkId
        await queryRunner.query(`
            ALTER TABLE "users_clerk" 
            ADD COLUMN "clerkId" character varying
        `);

        // Copier les données de clerk_user_id vers clerkId
        await queryRunner.query(`
            UPDATE "users_clerk" 
            SET "clerkId" = "clerk_user_id"
        `);

        // Supprimer la colonne clerk_user_id
        await queryRunner.query(`
            ALTER TABLE "users_clerk" 
            DROP COLUMN "clerk_user_id"
        `);
    }
} 