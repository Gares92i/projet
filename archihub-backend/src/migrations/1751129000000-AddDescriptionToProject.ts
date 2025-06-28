import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionToProject1751129000000 implements MigrationInterface {
    name = 'AddDescriptionToProject1751129000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "name" character varying`);
        await queryRunner.query(`UPDATE "projects" SET "name" = 'Projet sans nom' WHERE "name" IS NULL`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "name" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "description"`);
    }
} 