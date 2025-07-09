import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeOwnerIdToVarcharInClients1751500000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Supprimer la contrainte FK si elle existe
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "FK_clients_owner";`);
        // Modifier le type de la colonne owner_id
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "owner_id" TYPE varchar USING owner_id::varchar;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revenir à uuid (attention, perte de données possible si valeurs non UUID)
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "owner_id" TYPE uuid USING owner_id::uuid;`);
        // (Optionnel) Recréer la contrainte FK si besoin
        // await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "FK_clients_owner" FOREIGN KEY ("owner_id") REFERENCES "users_clerk"("id") ON DELETE SET NULL;`);
    }
} 