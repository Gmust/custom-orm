#!/usr/bin/env node
import { Command } from 'commander';
import { ConnectionManager } from '../connection/connection.manager';
import { SchemaManager } from '../schema/schema.manager';
import { MigrationGenerator } from '../migration/migration.generator';
import { config } from 'dotenv';

config();

const program = new Command();
const connection = new ConnectionManager();
const schemaManager = new SchemaManager();
const migrationGenerator = new MigrationGenerator();

program
  .version('1.0.0')
  .description('Custom ORM CLI for managing database migrations');

program
  .command('init')
  .description('Initialize the database and migrations')
  .action(async () => {
    try {
      const initQuery = await migrationGenerator.initialize();
      await connection.query(initQuery);
      console.log('Database initialized successfully');
      process.exit(0);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    }
  });

program
  .command('create <name>')
  .description('Create a new migration')
  .action(async (name: string) => {
    try {
      await schemaManager.loadSchema();
      const tables = schemaManager.getAllTables();

      const upQueries: string[] = [];
      const downQueries: string[] = [];

      for (const table of tables) {
        const { up, down } = migrationGenerator.generateCreateTableSQL(table);
        console.log('Generated SQL:', up[0]);
        upQueries.push(...up);
        downQueries.push(...down);
      }

      await migrationGenerator.createMigration(name, upQueries, downQueries);
      console.log(`Migration ${name} created successfully`);
      process.exit(0);
    } catch (error) {
      console.error('Failed to create migration:', error);
      process.exit(1);
    }
  });

program
  .command('up')
  .description('Run all pending migrations')
  .action(async () => {
    try {
      const migrations = await migrationGenerator.getMigrations();
      const executedMigrations = await connection.query<{ id: string }>(
        'SELECT id FROM _migrations ORDER BY timestamp ASC',
      );
      const executedIds = new Set(executedMigrations.rows.map((row) => row.id));

      for (const migration of migrations) {
        if (!executedIds.has(migration.id)) {
          console.log(`Running migration: ${migration.name}`);
          await connection.transaction(async (client) => {
            for (const query of migration.up) {
              await client.query(query);
            }
            await client.query(
              'INSERT INTO _migrations (id, name, timestamp) VALUES ($1, $2, $3)',
              [migration.id, migration.name, migration.timestamp],
            );
          });
          console.log(`Migration ${migration.name} completed`);
        }
      }
      console.log('All migrations completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Failed to run migrations:', error);
      process.exit(1);
    }
  });

program
  .command('down')
  .description('Rollback the last migration')
  .action(async () => {
    try {
      const lastMigration = await connection.query<{
        id: string;
        name: string;
      }>('SELECT id, name FROM _migrations ORDER BY timestamp DESC LIMIT 1');

      if (lastMigration.rows.length === 0) {
        console.log('No migrations to rollback');
        process.exit(0);
      }

      const migrations = await migrationGenerator.getMigrations();
      const migration = migrations.find(
        (m) => m.id === lastMigration.rows[0].id,
      );

      if (!migration) {
        throw new Error('Migration file not found');
      }

      console.log(`Rolling back migration: ${migration.name}`);
      await connection.transaction(async (client) => {
        for (const query of migration.down) {
          await client.query(query);
        }
        await client.query('DELETE FROM _migrations WHERE id = $1', [
          migration.id,
        ]);
      });

      console.log(`Migration ${migration.name} rolled back successfully`);
      process.exit(0);
    } catch (error) {
      console.error('Failed to rollback migration:', error);
      process.exit(1);
    }
  });

program
  .command('clear')
  .description('Forcefully clear the database by dropping all tables')
  .action(async () => {
    try {
      // Load the schema to get all table names
      await schemaManager.loadSchema();
      const tables = schemaManager.getAllTables();

      // Generate DROP TABLE statements
      const dropQueries = tables.map(
        (table) => `DROP TABLE IF EXISTS ${table.name} CASCADE;`,
      );

      // Execute each DROP TABLE statement
      await connection.transaction(async (client) => {
        for (const query of dropQueries) {
          console.log(`Executing: ${query}`);
          await client.query(query);
        }
      });

      console.log('Database cleared successfully');
      process.exit(0);
    } catch (error) {
      console.error('Failed to clear the database:', error);
      process.exit(1);
    }
  });
program.parse(process.argv);
