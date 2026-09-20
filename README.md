# Neon Nook

Neon Nook is a short-session study arcade for Python, data, AI, and ML concepts. Missions work locally; the optional Cerebras coach adds a hint or explanation when it is available.

## Run locally

Install packages, then copy `.env.example` to `.env` and add your Cerebras key only to that local server environment. Do not add a key to client-side variables or commit `.env`.

```sh
npm install
npm run server
```

In a second terminal:

```sh
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). The dev server forwards `/api` requests to the coach server at port `8787`.

## Coach configuration

`CEREBRAS_API_KEY` is required only for live Cerebras responses. Without it, or if the API is unavailable, the server and game use a short local explanation so missions remain playable.

`CEREBRAS_MODEL` is optional and defaults to `gpt-oss-120b`. Set it in the server environment to use another compatible model, such as `qwen-3.8-27b`.

The server validates coach requests and provider responses, times out provider calls, and limits each IP to 20 coach requests per minute.

## Deployment

For a Render web service, use `npm run build` as the build command and `npm start` as the start command. Render supplies `PORT`; configure `CEREBRAS_API_KEY` and any `CEREBRAS_MODEL` override as server environment variables.

## Checks

```sh
npm test
npm run build
```
