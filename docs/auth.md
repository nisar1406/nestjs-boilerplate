# Auth

## Table of Contents <!-- omit in toc -->

- [Auth](#auth)
  - [General info](#general-info)
    - [Auth via email flow](#auth-via-email-flow)
  - [Configure Auth](#configure-auth)
  - [About JWT strategy](#about-jwt-strategy)
  - [Refresh token flow](#refresh-token-flow)
  - [Logout](#logout)

---

## General info

### Auth via email flow

By default boilerplate used sign in and sign up via email and password.

```mermaid
sequenceDiagram
    participant A as Fronted App (Web, Mobile, Desktop)
    participant B as Backend App

    A->>B: 1. Sign up via email and password
    A->>B: 2. Sign in via email and password
    B->>A: 3. Get a JWT token
    A->>B: 4. Make any requests using a JWT token
```

## Configure Auth

1. Generate secret keys for `access token` and `refresh token`:

   ```bash
   node -e "console.log('\nJWT_ACCESS_SECRET=' + require('crypto').randomBytes(256).toString('base64') + '\n\nJWT_REFRESH_SECRET=' + require('crypto').randomBytes(256).toString('base64') + '\n\nJWT_FORGOT_SECRET=' + require('crypto').randomBytes(256).toString('base64') + '\n\nAUTH_CONFIRM_EMAIL_SECRET=' + require('crypto').randomBytes(256).toString('base64'));"
   ```

1. Go to `/.env` and replace `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` with output from step 1.

   ```text
   JWT_ACCESS_SECRET=HERE_SECRET_KEY_FROM_STEP_1
   JWT_REFRESH_SECRET=HERE_SECRET_KEY_FROM_STEP_1
   ```

## About JWT strategy

To better understand how JWT works, watch the video explanation https://www.youtube.com/watch?v=Y2H3DXDeS3Q and read this article https://jwt.io/introduction/

> If you need to get full user information, get it in services.

## Refresh token flow

1. On sign in (`POST /auth/email/login`) you will receive `token`, `tokenExpires` and `refreshToken` in response.
1. On each regular request you need to send `token` in `Authorization` header.
1. If `token` is expired (check with `tokenExpires` property on client app) you need to send `refreshToken` to `POST /auth/refresh` in `Authorization` header to refresh `token`. You will receive new `token`, `tokenExpires` and `refreshToken` in response.

## Logout

1. Call following endpoint:

   ```text
   POST /auth/logout
   ```

2. Remove `access token` and `refresh token` from your client app (cookies, localStorage, etc).

---

Previous: [Working with database](database.md)

Next: [File uploading](file-uploading.md)
