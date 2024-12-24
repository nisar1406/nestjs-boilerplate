## Description <!-- omit in toc -->

NestJS REST API boilerplate for building scalable and maintainable server-side applications using NestJS.

[Full documentation here](/docs/readme.md)

## Table of Contents <!-- omit in toc -->

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Modular Architecture**: Easy to extend and maintain.
- **TypeORM Integration**: Database management with TypeORM.
- **Authentication**: JWT-based authentication.
- **Validation**: Request validation using class-validator.
- **Configuration Management**: Centralized configuration with dotenv.
- [x] Database. Support [Mongoose](https://www.npmjs.com/package/mongoose).
- [x] Seeding.
- [x] Config Service ([@nestjs/config](https://www.npmjs.com/package/@nestjs/config)).
- [x] Mailing ([nodemailer](https://www.npmjs.com/package/nodemailer)).
- [x] Sign in and sign up via email.
- [x] Internationalization/Translations (I18N) ([nestjs-i18n](https://www.npmjs.com/package/nestjs-i18n)).
- [x] File uploads.
- [x] Swagger.
- [x] E2E and units tests.

## Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher) or yarn (v1.x or higher)
- Mongodb

## Installation

1. **Clone the repository**:
    ```sh
    git clone https://github.com/nisar1406/nestjs-boilerplate.git
    cd nestjs-boilerplate
    ```

2. **Install dependencies**:
    ```sh
    npm install
    # or
    yarn install
    ```

3. **Configure the environment variables**:
    - Create a `.env` file in the root directory.
    - Copy the contents of `.env.example` to `.env` and update the variables as needed.

4. **Run the seed commands**:
    ```sh
    npm run seed:create:document
    # or
    yarn seed:create:document
    ```

    ```sh
    npm run seed:run:document
    # or
    yarn seed:run:document
    ```

## Usage

1. **Start the development server**:
    ```sh
    npm run start:dev
    # or
    yarn start:dev
    ```

2. **Access the application**:
    - The application will be running at `http://localhost:3000`.

## Project Structure

```plaintext
src/
├── config/           # Configuration files
├── database/         # DB connection
├── decorators/       # Custom decorators
├── filters/          # Custom filters for exception handling
├── guards/           # Authentication and authorization guards
├── interceptors/     # Custom interceptors
├── middleware/       # Custom middlewares
├── models/           # DB models
├── mail/             # Mail service and templates
├── main.ts           # Entry point of the application
├── modules/          # Application modules
│   ├── auth/         # Authentication module
│   ├── file/         # File upload module
│   ├── user/         # User management module
├── pipes/            # Custom pipes
├── utils/            # Custom functions, constants
# Other directories and files
```

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
