declare module 'pg' {
  export class Pool {
    constructor(config?: PoolConfig);
    connect(): Promise<PoolClient>;
    end(): Promise<void>;
  }

  export class PoolClient {
    query<T = any>(queryText: string, values?: any[]): Promise<QueryResult<T>>;
    release(): void;
  }

  export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    command: string;
    oid: number;
    fields: FieldDef[];
  }

  export interface FieldDef {
    name: string;
    tableID: number;
    columnID: number;
    dataTypeID: number;
    dataTypeSize: number;
    dataTypeModifier: number;
    format: string;
  }

  export interface PoolConfig {
    user?: string;
    password?: string;
    host?: string;
    database?: string;
    port?: number;
    connectionString?: string;
    ssl?: boolean | object;
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
    application_name?: string;
  }
}
