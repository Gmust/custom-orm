// app.service.ts
import { Injectable } from '@nestjs/common';
import { ConnectionManager } from './orm/connection/connection.manager';
import { QueryBuilder } from './orm/query-builder';

@Injectable()
export class AppService {
  constructor(private readonly db: ConnectionManager) {}

  async createUser(user: {
    email: string;
    name: string;
    settings?: Record<string, unknown>;
  }) {
    const now = new Date();
    const qb = new QueryBuilder({ table: 'users' }).insert({
      email: user.email,
      name: user.name,
      settings: user.settings ?? {},
      created_at: now,
      updated_at: now,
    });

    const { sql, params } = qb.buildInsert();

    // Use db.query(), not db.query<UserRow>
    const result = await this.db.query(sql, params);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.rows[0];
  }
}
