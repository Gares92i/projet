import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUserClerkColumn1751200000001 implements MigrationInterface {
    name = 'FixUserClerkColumn1751200000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Vérifier si la colonne clerkId existe
        const hasClerkIdColumn = await queryRunner.hasColumn('users_clerk', 'clerkId');
        
        if (hasClerkIdColumn) {
            // Renommer la colonne clerkId en clerk_user_id
            await queryRunner.query(`ALTER TABLE "users_clerk" RENAME COLUMN "clerkId" TO "clerk_user_id"`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Vérifier si la colonne clerk_user_id existe
        const hasClerkUserIdColumn = await queryRunner.hasColumn('users_clerk', 'clerk_user_id');
        
        if (hasClerkUserIdColumn) {
            // Renommer la colonne clerk_user_id en clerkId
            await queryRunner.query(`ALTER TABLE "users_clerk" RENAME COLUMN "clerk_user_id" TO "clerkId"`);
        }
    }
} 