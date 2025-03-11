import { Injectable } from '@nestjs/common';
import { TableSchema, ColumnDefinition } from '../schema/schema.types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';

interface Migration {
  id: string;
  name: string;
  timestamp: number;
  up: string[];
  down: string[];
}

interface SQLResult {
  up: string[];
  down: string[];
}

const migrationSchema = z.object({
  id: z.string(),
  name: z.string(),
  timestamp: z.number(),
  up: z.array(z.string()),
  down: z.array(z.string()),
});

@Injectable()
export class MigrationGenerator {
  private migrationsDir: string;
  private migrationsTableName = '_migrations';

  constructor() {
    this.migrationsDir = path.join(process.cwd(), 'migrations');
  }

  async initialize(): Promise<string> {
    await fs.mkdir(this.migrationsDir, { recursive: true });

    // Create migrations tracking table if it doesn't exist
    const createMigrationsTable = `
      CREATE TABLE IF NOT EXISTS ${this.migrationsTableName} (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        timestamp BIGINT NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return createMigrationsTable;
  }

  generateCreateTableSQL(table: TableSchema): SQLResult {
    const up: string[] = [];
    const down: string[] = [];

    // Generate CREATE TABLE statement
    let createSQL = `CREATE TABLE ${table.name} (\n`;
    const columnDefinitions: string[] = [];

    for (const [columnName, column] of Object.entries(table.columns)) {
      columnDefinitions.push(this.generateColumnDefinition(columnName, column));
    }

    if (table.timestamps) {
      columnDefinitions.push('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      columnDefinitions.push('updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    }

    createSQL += columnDefinitions.join(',\n');
    createSQL += '\n);';

    // Add indexes for unique columns
    for (const [columnName, column] of Object.entries(table.columns)) {
      if (column.unique) {
        createSQL += `\nCREATE UNIQUE INDEX ${table.name}_${columnName}_unique ON ${table.name}(${columnName});`;
      }
    }

    // Add foreign key constraints
    for (const [columnName, column] of Object.entries(table.columns)) {
      if (column.references) {
        const {
          table: refTable,
          column: refColumn,
          onDelete,
        } = column.references;

        createSQL += `\nALTER TABLE ${table.name} ADD CONSTRAINT fk_${table.name}_${columnName} `;
        createSQL += `FOREIGN KEY (${columnName}) REFERENCES ${refTable}(${refColumn})`;
        if (onDelete) {
          createSQL += ` ON DELETE ${onDelete}`;
        }
        createSQL += ';';
      }
    }

    up.push(createSQL);
    down.push(`DROP TABLE IF EXISTS ${table.name};`);

    return { up, down };
  }

  private generateColumnDefinition(
    columnName: string,
    column: ColumnDefinition,
  ): string {
    let sql = `${columnName} ${this.getPostgresType(column.type)}`;

    if (column.primary) {
      if (column.type === 'number') {
        sql += ' INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY';
      } else if (column.type === 'uuid') {
        sql += ' PRIMARY KEY DEFAULT gen_random_uuid()';
      } else {
        sql += ' PRIMARY KEY';
      }
    }

    if (!column.nullable && !column.primary) {
      sql += ' NOT NULL';
    }

    if (column.default !== undefined && !column.primary) {
      sql += ` DEFAULT ${this.getDefaultValueSQL(column.default, column.type)}`;
    }

    return sql;
  }

  private getPostgresType(type: string): string {
    const typeMap: Record<string, string> = {
      string: 'VARCHAR(255)',
      number: 'INTEGER',
      boolean: 'BOOLEAN',
      date: 'TIMESTAMP',
      json: 'JSONB',
      uuid: 'UUID',
    };

    return typeMap[type] || 'VARCHAR(255)';
  }

  private getDefaultValueSQL(value: any, type: string): string {
    if (value === null) return 'NULL';
    if (type === 'string') return `'${value}'`;
    if (type === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (type === 'json') return `'${JSON.stringify(value)}'::jsonb`;
    return String(value);
  }

  async createMigration(
    name: string,
    upQueries: string[],
    downQueries: string[],
  ): Promise<void> {
    const timestamp = Date.now();
    const id = `${timestamp}_${name}`;

    const migration: Migration = {
      id,
      name,
      timestamp,
      up: upQueries,
      down: downQueries,
    };

    const filePath = path.join(this.migrationsDir, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(migration, null, 2));
  }

  async getMigrations(): Promise<Migration[]> {
    const files = await fs.readdir(this.migrationsDir);
    const migrations: Migration[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(
          path.join(this.migrationsDir, file),
          'utf-8',
        );
        const parsed = migrationSchema.parse(JSON.parse(content));
        migrations.push(parsed);
      }
    }

    return migrations.sort((a, b) => a.timestamp - b.timestamp);
  }
}
