# Work with database

---

## Table of Contents <!-- omit in toc -->

- [Work with database](#work-with-database)
  - [About databases](#about-databases)
  - [Working with database schema (Mongoose)](#working-with-database-schema-mongoose)
    - [Create schema](#create-schema)
  - [Seeding (Mongoose)](#seeding-mongoose)
    - [Creating seeds (Mongoose)](#creating-seeds-mongoose)
    - [Run seed (Mongoose)](#run-seed-mongoose)
  - [Performance optimization (MongoDB + Mongoose)](#performance-optimization-mongodb--mongoose)
    - [Design schema](#design-schema)

---

## About databases

Boilerplate supports two types of databases: MongoDB with Mongoose.

For support of database used Hexagonal Architecture. Hexagonal architecture takes more effort to implement, but it gives more flexibility and scalability.

## Working with database schema (Mongoose)

### Create schema

1. Create entity file with extension `.schema.ts`. For example `post.schema.ts`:

   ```ts
   // /src/posts/infrastructure/persistence/document/entities/post.schema.ts

   import { Document, Schema, model } from 'mongoose';

   export interface IToken extends Document {
      title: string;
      body: string;
      // ...other
    }

  export const TokenSchema = new Schema<IToken>({
    title: String,
    body: String,
    // ...other
  },
  {
    timestamps: true
  },);

export const TokenModel = model<IToken>('Tokens', TokenSchema);

   ```

---

## Seeding (Mongoose)

### Creating seeds (Mongoose)

1. Create seed file with `npm run seed:create:document -- --name=Post`. Where `Post` is name of entity.
1. Go to `src/database/seeds/document/post/post-seed.service.ts`.
1. In `run` method extend your logic.
1. Run [npm run seed:run:document](#run-seed-mongoose)

### Run seed (Mongoose)

```bash
npm run seed:run:document
```

---

## Performance optimization (MongoDB + Mongoose)

### Design schema

Designing schema for MongoDB is completely different from designing schema for relational databases. For best performance, you should design your schema according to:

1. [MongoDB Schema Design Anti-Patterns](https://www.mongodb.com/developer/products/mongodb/schema-design-anti-pattern-massive-arrays)
1. [MongoDB Schema Design Best Practices](https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/)

---

Previous: [Architecture](architecture.md)

Next: [Auth](auth.md)
