import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, PoolClient, PoolConfig } from 'pg';
import type { QueryResult } from 'pg';

type CustomQueryResultRow = Record<string, any>; // Adjust this type according to your needs

@Injectable()
export class ConnectionManager implements OnModuleInit, OnModuleDestroy {
  private pool: Pool | null = null;

  constructor() {
    this.initializePool();
  }

  private initializePool(): void {
    const config = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432', 10),
    } satisfies PoolConfig;

    this.pool = new Pool(config);
  }

  async onModuleInit(): Promise<void> {
    try {
      if (!this.pool) {
        this.initializePool();
      }
      const client = await this.pool!.connect();
      client.release();
      console.log('Database connection established successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw new Error('Failed to initialize database connection');
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return await this.pool.connect();
  }

  async query<T extends CustomQueryResultRow = any>(
    sql: string,
    params: any[] = [],
  ): Promise<QueryResult<T>> {
    const client = await this.getClient();
    try {
      return await client.query(sql, params);
    } finally {
      client.release();
    }
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async executeQueries(queries: string[]): Promise<void> {
    await this.transaction(async (client) => {
      for (const query of queries) {
        await client.query(query);
      }
    });
  }
}
