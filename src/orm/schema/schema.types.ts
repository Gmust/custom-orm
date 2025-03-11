import { z } from 'zod';

export type ColumnType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'json'
  | 'uuid';

export interface ColumnDefinition {
  type: ColumnType;
  nullable?: boolean;
  unique?: boolean;
  primary?: boolean;
  default?: any;
  references?: {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  };
}

export interface TableSchema {
  name: string;
  columns: Record<string, ColumnDefinition>;
  timestamps?: boolean; // Adds created_at and updated_at columns
}

export interface DatabaseSchema {
  tables: TableSchema[];
}

// Zod schema for validation
export const columnDefinitionSchema = z.object({
  type: z.enum(['string', 'number', 'boolean', 'date', 'json', 'uuid']),
  nullable: z.boolean().optional(),
  unique: z.boolean().optional(),
  primary: z.boolean().optional(),
  default: z.any().optional(),
  references: z
    .object({
      table: z.string(),
      column: z.string(),
      onDelete: z.enum(['CASCADE', 'SET NULL', 'RESTRICT']).optional(),
    })
    .optional(),
});

export const tableSchema = z.object({
  name: z.string(),
  columns: z.record(columnDefinitionSchema),
  timestamps: z.boolean().optional(),
});

export const databaseSchema = z.object({
  tables: z.array(tableSchema),
});
