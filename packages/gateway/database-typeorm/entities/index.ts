import {
  Entity,
  PrimaryColumn,
  JoinColumn,
  Column,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';

@Entity('docs')
export class DMDoc {
  @PrimaryColumn('uuid')
  id: string;
}

@Entity('gene_analytic_tasks')
export class DMTask {
  @OneToOne(() => DMDoc, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'doc_id',
  })
  doc: DMDoc;

  @Column({
    nullable: false,
    type: 'uuid',
  })
  doc_id: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  result: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  gene_file: string;

  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
  })
  status: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  reason: string;

  @CreateDateColumn()
  created_at: Date;
}
