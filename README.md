# Codex

This project was bootstrapped with a manual equivalent of `create-next-app` and
pre-configured for Prismic.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Fill in the values inside `.env.local` with your Prismic repository name and
   an access token that has the desired permissions.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to see the application.

## Prismic SDK check

Once the environment variables are configured, visit
[`/api/prismic-test`](http://localhost:3000/api/prismic-test?type=page) to run a
`client.getAllByType` query against your repository. You can provide a custom
Prismic custom type via the `type` query parameter if needed.
