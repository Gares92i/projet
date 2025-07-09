import { MigrationInterface, QueryRunner } from "typeorm";

export class AddArchitectInfoToCompanySettings1751400000000 implements MigrationInterface {
    name = 'AddArchitectInfoToCompanySettings1751400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "architectInfo" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_settings" DROP COLUMN IF EXISTS "architectInfo"`);
    }
} 