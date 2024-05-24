# Installation

NestJS Boilerplate supports [Mongoose](https://www.npmjs.com/package/mongoose) for working with databases.
---

## Table of Contents <!-- omit in toc -->

- [Installation](#installation)
  - [NestJS Boilerplate supports Mongoose for working with databases.](#nestjs-boilerplate-supports-mongoose-for-working-with-databases)
  - [Comfortable development (MongoDB + Mongoose)](#comfortable-development-mongodb--mongoose)
  - [Quick run (MongoDB + Mongoose)](#quick-run-mongodb--mongoose)
  - [Links](#links)

---

## Comfortable development (MongoDB + Mongoose)

1. Clone repository

   ```bash
   git clone --depth 1 https://github.com/nisar1406/nestjs-boilerplate.git my-app
   ```

1. Go to folder, and copy `env-example-document` as `.env`.

   ```bash
   cd my-app/
   cp env-example-document .env
   ```

1. Change `DATABASE_URL=mongodb://mongo:27017` to `DATABASE_URL=mongodb://localhost:27017`

2. Install dependency

   ```bash
   npm install
   ```

3. Run seeds

   ```bash
   npm run seed:run:document
   ```

4. Run app in dev mode

   ```bash
   npm run start:dev
   ```

5. Open <http://localhost:3001>

---

## Quick run (MongoDB + Mongoose)

If you want quick run your app, you can use following commands:

1. Clone repository

   ```bash
   git clone --depth 1 https://github.com/nisar1406/nestjs-boilerplate.git my-app
   ```

1. Go to folder, and copy `env-example-document` as `.env`.

   ```bash
   cd my-app/
   cp sample.env .env
   ```

2. Open <http://localhost:3001>

---

## Links

- Swagger (API docs): <http://localhost:3001/docs>****
- Maildev: <http://localhost:1080>

---

Previous: [Introduction](introduction.md)

Next: [Architecture](architecture.md)
