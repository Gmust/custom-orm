import { Module, DynamicModule } from '@nestjs/common';
import { ConnectionManager } from './connection/connection.manager';
import { SchemaManager } from './schema/schema.manager';
import { MigrationGenerator } from './migration/migration.generator';

export interface OrmModuleOptions {
  databaseUrl?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

@Module({})
export class OrmModule {
  static forRoot(options: OrmModuleOptions = {}): DynamicModule {
    // Set environment variables based on options
    if (options.databaseUrl) {
      process.env.DATABASE_URL = options.databaseUrl;
    } else {
      process.env.DB_HOST = options.host || process.env.DB_HOST;
      process.env.DB_PORT = options.port?.toString() || process.env.DB_PORT;
      process.env.DB_USER = options.username || process.env.DB_USER;
      process.env.DB_PASSWORD = options.password || process.env.DB_PASSWORD;
      process.env.DB_NAME = options.database || process.env.DB_NAME;
    }

    return {
      module: OrmModule,
      providers: [ConnectionManager, SchemaManager, MigrationGenerator],
      exports: [ConnectionManager, SchemaManager, MigrationGenerator],
      global: true,
    };
  }
}
