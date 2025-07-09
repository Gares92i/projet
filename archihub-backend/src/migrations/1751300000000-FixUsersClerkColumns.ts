import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUsersClerkColumns1751300000000 implements MigrationInterface {
    name = 'FixUsersClerkColumns1751300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Supprimer la colonne clerk_user_id redondante
        await queryRunner.query(`ALTER TABLE "users_clerk" DROP COLUMN "clerk_user_id"`);
        
        // S'assurer que clerkId est bien utilisée et unique
        await queryRunner.query(`ALTER TABLE "users_clerk" ALTER COLUMN "clerkId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users_clerk" ADD CONSTRAINT "UQ_users_clerk_clerkId" UNIQUE ("clerkId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restaurer la colonne clerk_user_id
        await queryRunner.query(`ALTER TABLE "users_clerk" ADD "clerk_user_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users_clerk" DROP CONSTRAINT "UQ_users_clerk_clerkId"`);
    }
} 