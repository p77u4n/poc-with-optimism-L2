import { MigrationInterface, QueryRunner } from "typeorm";

export class init1715768879734 implements MigrationInterface {
    name = 'init1715768879734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "gene_analytic_tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "result" text, "gene_file" text, "status" character varying(16) NOT NULL, "reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4c69b6f1f4e399f2136e74482ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" ADD CONSTRAINT "FK_4501eb6918c71156a6b836ee526" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gene_analytic_tasks" DROP CONSTRAINT "FK_4501eb6918c71156a6b836ee526"`);
        await queryRunner.query(`DROP TABLE "gene_analytic_tasks"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
