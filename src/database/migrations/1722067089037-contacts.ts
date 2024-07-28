import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Contacts1722067089037 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
          new Table({
            name: 'contact',
            columns: [
              {
                name: 'id',
                type: 'int',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment',
              },
              {
                name: 'phoneNumber',
                type: 'varchar',
                isNullable: true,
              },
              {
                name: 'email',
                type: 'varchar',
                isNullable: true,
              },
              {
                name: 'linkedId',
                type: 'int',
                isNullable: true,
              },
              {
                name: 'linkPrecedence',
                type: 'enum',
                enum: ['primary', 'secondary'],
                default: "'primary'",
              },
              {
                name: 'createdAt',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
              },
              {
                name: 'updatedAt',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
                onUpdate: 'CURRENT_TIMESTAMP',
              },
              {
                name: 'deletedAt',
                type: 'timestamp',
                isNullable: true,
              },
            ],
          }),
          true,
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('contact');
      }

}
