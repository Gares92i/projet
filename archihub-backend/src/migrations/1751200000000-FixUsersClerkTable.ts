import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUsersClerkTable1751200000000 implements MigrationInterface {
    name = 'FixUsersClerkTable1751200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Vérifier si la colonne clerk_user_id existe et la supprimer si c'est le cas
        const hasClerkUserId = await queryRunner.hasColumn('users_clerk', 'clerk_user_id');
        if (hasClerkUserId) {
            await queryRunner.query(`ALTER TABLE "users_clerk" DROP COLUMN "clerk_user_id"`);
        }

        // S'assurer que la colonne clerkId existe
        const hasClerkId = await queryRunner.hasColumn('users_clerk', 'clerkId');
        if (!hasClerkId) {
            await queryRunner.query(`ALTER TABLE "users_clerk" ADD "clerkId" character varying NOT NULL`);
        }

        // S'assurer que la colonne name existe
        const hasName = await queryRunner.hasColumn('users_clerk', 'name');
        if (!hasName) {
            await queryRunner.query(`ALTER TABLE "users_clerk" ADD "name" character varying`);
        }

        // S'assurer que les colonnes de timestamp utilisent les bons noms
        const hasCreatedAt = await queryRunner.hasColumn('users_clerk', 'createdAt');
        if (hasCreatedAt) {
            await queryRunner.query(`ALTER TABLE "users_clerk" DROP COLUMN "createdAt"`);
        }
        
        const hasUpdatedAt = await queryRunner.hasColumn('users_clerk', 'updatedAt');
        if (hasUpdatedAt) {
            await queryRunner.query(`ALTER TABLE "users_clerk" DROP COLUMN "updatedAt"`);
        }

        // Ajouter les colonnes de timestamp avec les bons noms
        const hasCreatedAtCorrect = await queryRunner.hasColumn('users_clerk', 'created_at');
        if (!hasCreatedAtCorrect) {
            await queryRunner.query(`ALTER TABLE "users_clerk" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        }

        const hasUpdatedAtCorrect = await queryRunner.hasColumn('users_clerk', 'updated_at');
        if (!hasUpdatedAtCorrect) {
            await queryRunner.query(`ALTER TABLE "users_clerk" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        }

        // Ajouter un index unique sur clerkId s'il n'existe pas
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_clerk_clerkId" ON "users_clerk" ("clerkId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer l'index unique
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_clerk_clerkId"`);
        
        // Supprimer les colonnes ajoutées
        await queryRunner.query(`ALTER TABLE "users_clerk" DROP COLUMN IF EXISTS "name"`);
        await queryRunner.query(`ALTER TABLE "users_clerk" DROP COLUMN IF EXISTS "clerkId"`);
        await queryRunner.query(`ALTER TABLE "users_clerk" DROP COLUMN IF EXISTS "created_at"`);
        await queryRunner.query(`ALTER TABLE "users_clerk" DROP COLUMN IF EXISTS "updated_at"`);
    }
} 