import { TableSchema } from '../schema/schema.types';
import { MigrationGenerator } from './migration.generator';

function sortTablesByDependency(tables: TableSchema[]): TableSchema[] {
  const graph = new Map<string, Set<string>>();
  const nameToTable = new Map<string, TableSchema>();

  for (const table of tables) {
    nameToTable.set(table.name, table);
    const deps = new Set<string>();
    for (const col of Object.values(table.columns)) {
      if (col.references) deps.add(col.references.table);
    }
    graph.set(table.name, deps);
  }

  const visited = new Set<string>();
  const result: TableSchema[] = [];

  function visit(name: string, path = new Set<string>()) {
    if (visited.has(name)) return;
    if (path.has(name)) throw new Error(`Circular dependency: ${name}`);
    path.add(name);

    for (const dep of graph.get(name) ?? []) {
      visit(dep, path);
    }

    path.delete(name);
    visited.add(name);
    result.push(nameToTable.get(name)!);
  }

  for (const name of graph.keys()) {
    visit(name);
  }

  return result;
}

export function buildMigration(
  name: string,
  tables: TableSchema[],
  generator: MigrationGenerator,
): { id: string; up: string[]; down: string[] } {
  const sorted = sortTablesByDependency(tables);
  const up: string[] = [];
  const down: string[] = [];

  for (const table of sorted) {
    const { up: upSQL, down: downSQL } =
      generator.generateCreateTableSQL(table);
    generator.generateCreateTableSQL(table);
    up.push(...upSQL);
    down.unshift(...downSQL);
  }

  const timestamp = Date.now();
  const id = `${timestamp}_${name}`;
  return { id, up, down };
}
