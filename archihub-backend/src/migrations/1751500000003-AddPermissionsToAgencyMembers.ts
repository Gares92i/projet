import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPermissionsToAgencyMembers1751500000003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agency_members" ADD COLUMN IF NOT EXISTS "permissions" jsonb DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agency_members" DROP COLUMN IF EXISTS "permissions"`);
    }
} 