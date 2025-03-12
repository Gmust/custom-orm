import * as fs from 'fs';
import { TableSchema } from './schema.types';

const schema: { tables: TableSchema[] } = {
  tables: [
    {
      name: 'users',
      columns: {
        id: { type: 'number', primary: true },
        email: { type: 'string', unique: true, nullable: false },
        name: { type: 'string', nullable: false },
        settings: { type: 'json', default: '{}' },
      },
      timestamps: true,
    },
    {
      name: 'posts',
      columns: {
        id: { type: 'uuid', primary: true },
        title: { type: 'string', nullable: false },
        content: { type: 'string', nullable: false },
        published: { type: 'boolean', default: false },
        user_id: {
          type: 'uuid',
          nullable: false,
          references: { table: 'users', column: 'id', onDelete: 'CASCADE' },
        },
      },
      timestamps: true,
    },
    {
      name: 'comments',
      columns: {
        id: { type: 'uuid', primary: true },
        content: { type: 'string', nullable: false },
        user_id: {
          type: 'uuid',
          nullable: false,
          references: { table: 'users', column: 'id', onDelete: 'CASCADE' },
        },
        post_id: {
          type: 'uuid',
          nullable: false,
          references: { table: 'posts', column: 'id', onDelete: 'CASCADE' },
        },
      },
      timestamps: true,
    },
    // Additional tables
    {
      name: 'categories',
      columns: {
        id: { type: 'uuid', primary: true },
        name: { type: 'string', unique: true, nullable: false },
      },
      timestamps: true,
    },
    {
      name: 'tags',
      columns: {
        id: { type: 'uuid', primary: true },
        label: { type: 'string', unique: true, nullable: false },
      },
      timestamps: true,
    },
  ],
};

const schemaPath = 'schema.json';

try {
  console.log('Generating JSON schema...');
  const schemaJson = JSON.stringify(schema, null, 2);
  fs.writeFileSync(schemaPath, schemaJson, 'utf-8');
  console.log(`Schema saved to ${schemaPath}`);
} catch (error) {
  console.error('An error occurred while generating JSON schema:', error);
}
