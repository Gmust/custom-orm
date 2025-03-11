<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Custom ORM with Dynamic Schema Generation

A NestJS-based ORM that supports dynamic schema generation and database migrations.

## Features

- Dynamic schema definition using TypeScript and Zod validation
- Automatic migration generation based on schema changes
- PostgreSQL support with connection pooling
- CLI tools for managing migrations
- Type-safe database operations

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your database configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=your_database
```

## Usage

### 1. Define Your Schema

Create a schema definition file (e.g., `schema.json`) in your project root:

```json
{
  "tables": [
    {
      "name": "users",
      "columns": {
        "id": {
          "type": "uuid",
          "primary": true
        },
        "email": {
          "type": "string",
          "unique": true,
          "nullable": false
        },
        "name": {
          "type": "string",
          "nullable": false
        },
        "created_at": {
          "type": "date",
          "default": "CURRENT_TIMESTAMP"
        }
      },
      "timestamps": true
    },
    {
      "name": "posts",
      "columns": {
        "id": {
          "type": "uuid",
          "primary": true
        },
        "title": {
          "type": "string",
          "nullable": false
        },
        "content": {
          "type": "string",
          "nullable": false
        },
        "user_id": {
          "type": "uuid",
          "nullable": false,
          "references": {
            "table": "users",
            "column": "id",
            "onDelete": "CASCADE"
          }
        }
      },
      "timestamps": true
    }
  ]
}
```

### 2. Initialize the ORM

In your NestJS application's `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { OrmModule } from './orm/orm.module';

@Module({
  imports: [
    OrmModule.forRoot({
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'your_database',
    }),
  ],
})
export class AppModule {}
```

### 3. Manage Migrations

Initialize the database and migrations table:
```bash
npm run migrate:init
```

Create a new migration:
```bash
npm run migrate:create initial
```

Run pending migrations:
```bash
npm run migrate:up
```

Rollback the last migration:
```bash
npm run migrate:down
```

### 4. Using the ORM in Your Services

```typescript
import { Injectable } from '@nestjs/common';
import { ConnectionManager } from './orm/connection/connection.manager';

@Injectable()
export class UserService {
  constructor(private readonly connection: ConnectionManager) {}

  async createUser(email: string, name: string) {
    const result = await this.connection.query(
      'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
      [email, name]
    );
    return result.rows[0];
  }

  async getUserById(id: string) {
    const result = await this.connection.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
}
```

## Supported Column Types

- `string`: Maps to VARCHAR(255)
- `number`: Maps to INTEGER
- `boolean`: Maps to BOOLEAN
- `date`: Maps to TIMESTAMP
- `json`: Maps to JSONB
- `uuid`: Maps to UUID

## Column Options

- `type`: The data type of the column
- `nullable`: Whether the column can contain NULL values
- `unique`: Whether the column should have a unique constraint
- `primary`: Whether the column is a primary key
- `default`: Default value for the column
- `references`: Foreign key reference configuration
  - `table`: Referenced table name
  - `column`: Referenced column name
  - `onDelete`: Action on delete ('CASCADE', 'SET NULL', 'RESTRICT')

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
