import { MigrationInterface, QueryRunner } from "typeorm";

export class removeUserIdentifier1715836526025 implements MigrationInterface {
    name = 'removeUserIdentifier1715836526025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" DROP CONSTRAINT "FK_4501eb6918c71156a6b836ee526"`);
        await queryRunner.query(`CREATE TABLE "docs" ("id" uuid NOT NULL, CONSTRAINT "PK_3a13e0daf5db0055b25d829f2f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" DROP CONSTRAINT "PK_4c69b6f1f4e399f2136e74482ce"`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" ADD "doc_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" ADD CONSTRAINT "PK_d67b5d4eed1e17e3fbde2fedec7" PRIMARY KEY ("doc_id")`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" ADD CONSTRAINT "UQ_d67b5d4eed1e17e3fbde2fedec7" UNIQUE ("doc_id")`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" ADD CONSTRAINT "FK_d67b5d4eed1e17e3fbde2fedec7" FOREIGN KEY ("doc_id") REFERENCES "docs"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" DROP CONSTRAINT "FK_d67b5d4eed1e17e3fbde2fedec7"`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" DROP CONSTRAINT "UQ_d67b5d4eed1e17e3fbde2fedec7"`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" DROP CONSTRAINT "PK_d67b5d4eed1e17e3fbde2fedec7"`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" DROP COLUMN "doc_id"`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" ADD CONSTRAINT "PK_4c69b6f1f4e399f2136e74482ce" PRIMARY KEY ("id")`);
        await queryRunner.query(`DROP TABLE "docs"`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" ADD CONSTRAINT "FK_4501eb6918c71156a6b836ee526" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

}
