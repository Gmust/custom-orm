import { Injectable } from '@nestjs/common';
import { DatabaseSchema, TableSchema, databaseSchema } from './schema.types';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class SchemaManager {
  private schema: DatabaseSchema = { tables: [] };
  private schemaPath: string;

  constructor() {
    this.schemaPath = path.join(process.cwd(), 'schema.json');
  }

  async loadSchema(): Promise<void> {
    try {
      const content = await fs.readFile(this.schemaPath, 'utf-8');
      const parsedSchema = JSON.parse(content) as DatabaseSchema;
      const validatedSchema = databaseSchema.parse(parsedSchema);
      this.schema = validatedSchema;
    } catch (error: unknown) {
      if ((error as { code?: string }).code === 'ENOENT') {
        // Schema file doesn't exist, use empty schema
        this.schema = { tables: [] };
      } else {
        throw error;
      }
    }
  }

  async saveSchema(): Promise<void> {
    await fs.writeFile(
      this.schemaPath,
      JSON.stringify(this.schema, null, 2),
      'utf-8',
    );
  }

  addTable(table: TableSchema): void {
    if (this.schema.tables.some((t) => t.name === table.name)) {
      throw new Error(`Table ${table.name} already exists`);
    }
    this.schema.tables.push(table);
  }

  removeTable(tableName: string): void {
    this.schema.tables = this.schema.tables.filter((t) => t.name !== tableName);
  }

  getTable(tableName: string): TableSchema | undefined {
    return this.schema.tables.find((t) => t.name === tableName);
  }

  getAllTables(): TableSchema[] {
    return this.schema.tables;
  }

  updateTable(tableName: string, updatedTable: TableSchema): void {
    const index = this.schema.tables.findIndex((t) => t.name === tableName);
    if (index === -1) {
      throw new Error(`Table ${tableName} not found`);
    }
    this.schema.tables[index] = updatedTable;
  }

  validateSchema(): void {
    databaseSchema.parse(this.schema);
  }
}
