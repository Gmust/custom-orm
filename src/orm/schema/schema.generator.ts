import { TableSchema, ColumnDefinition } from './schema.types';

class SchemaGenerator {
  generateSQLFromSchema(schema: { tables: TableSchema[] }): string[] {
    return schema.tables.map((table) => this.generateCreateTableSQL(table));
  }

  private generateCreateTableSQL(table: TableSchema): string {
    const columnDefinitions = Object.entries(table.columns).map(
      ([columnName, column]) =>
        this.generateColumnDefinition(columnName, column),
    );

    if (table.timestamps) {
      columnDefinitions.push('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      columnDefinitions.push('updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    }

    let createSQL = `CREATE TABLE ${table.name} (\n${columnDefinitions.join(',\n')}\n);`;

    // Add unique indexes
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

    return createSQL;
  }

  private generateColumnDefinition(
    columnName: string,
    column: ColumnDefinition,
  ): string {
    let sql = `${columnName}`;

    if (column.primary) {
      if (column.type === 'number') {
        sql += ' INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY';
      } else if (column.type === 'uuid') {
        sql += ' UUID PRIMARY KEY DEFAULT gen_random_uuid()';
      } else {
        sql += ` ${this.getPostgresType(column.type)} PRIMARY KEY`;
      }
    } else {
      sql += ` ${this.getPostgresType(column.type)}`;

      if (!column.nullable) {
        sql += ' NOT NULL';
      }

      if (column.default !== undefined) {
        sql += ` DEFAULT ${this.getDefaultValueSQL(column.default, column.type)}`;
      }
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
}

export default SchemaGenerator;
