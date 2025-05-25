type ConditionOperator = '=' | '!=' | '<' | '<=' | '>' | '>=' | 'LIKE' | 'IN';

interface Condition {
  column: string;
  operator: ConditionOperator;
  value: any;
}

interface QueryBuilderOptions {
  table: string;
  alias?: string;
}

export class QueryBuilder {
  private table: string;
  private alias?: string;
  private fields: string[] = ['*'];
  private conditions: Condition[] = [];
  private joins: string[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private orderByClause: string = '';

  constructor(options: QueryBuilderOptions) {
    this.table = options.table;
    this.alias = options.alias;
  }

  select(fields: string[]): this {
    this.fields = fields;
    return this;
  }

  where(column: string, operator: ConditionOperator, value: unknown): this {
    this.conditions.push({ column, operator, value });
    return this;
  }

  join(table: string, onCondition: string): this {
    this.joins.push(`JOIN ${table} ON ${onCondition}`);
    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByClause = `ORDER BY ${column} ${direction}`;
    return this;
  }

  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  offset(offset: number): this {
    this.offsetValue = offset;
    return this;
  }

  build(): { sql: string; params: any[] } {
    const tableRef = this.alias ? `${this.table} AS ${this.alias}` : this.table;
    let sql = `SELECT ${this.fields.join(', ')} FROM ${tableRef}`;
    if (this.joins.length) {
      sql += ' ' + this.joins.join(' ');
    }

    const params: any[] = [];
    if (this.conditions.length) {
      const whereClauses = this.conditions.map((cond) => {
        params.push(cond.value);
        return `${cond.column} ${cond.operator} $${params.length}`;
      });
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    if (this.orderByClause) {
      sql += ` ${this.orderByClause}`;
    }

    if (typeof this.limitValue !== 'undefined') {
      sql += ` LIMIT ${this.limitValue}`;
    }

    if (typeof this.offsetValue !== 'undefined') {
      sql += ` OFFSET ${this.offsetValue}`;
    }

    return { sql, params };
  }
}
