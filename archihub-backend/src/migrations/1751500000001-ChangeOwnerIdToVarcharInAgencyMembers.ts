import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeOwnerIdToVarcharInAgencyMembers1751500000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "agency_members" DROP CONSTRAINT IF EXISTS "FK_agency_members_owner";
        `);
        await queryRunner.query(`
            ALTER TABLE "agency_members"
            ALTER COLUMN "owner_id" TYPE varchar USING "owner_id"::varchar
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "agency_members"
            ALTER COLUMN "owner_id" TYPE uuid USING "owner_id"::uuid
        `);
        // La FK n'est pas recréée automatiquement dans le down
    }
} 