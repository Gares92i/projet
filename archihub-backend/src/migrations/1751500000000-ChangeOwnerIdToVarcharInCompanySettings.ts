import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeOwnerIdToVarcharInCompanySettings1751500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "company_settings"
            ALTER COLUMN "owner_id" TYPE varchar(64) USING "owner_id"::varchar
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "company_settings"
            ALTER COLUMN "owner_id" TYPE uuid USING "owner_id"::uuid
        `);
    }
} 