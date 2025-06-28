import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionToProject1751129000000 implements MigrationInterface {
    name = 'AddDescriptionToProject1751129000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" ADD "description" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "description"`);
    }
} 