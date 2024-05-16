import { MigrationInterface, QueryRunner } from "typeorm";

export class addSessionId1715843431056 implements MigrationInterface {
    name = 'addSessionId1715843431056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" ADD "session_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" DROP COLUMN "session_id"`);
    }

}
