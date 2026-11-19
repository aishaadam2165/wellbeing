# WellSpring AI — Node.js / MongoDB / hosted Gemma MVP

A local prototype for AI-powered behavioural recovery and personal wellbeing. The app uses **Node.js + Express**, **MongoDB + Mongoose**, server-rendered **EJS**, and the **Hugging Face Inference Providers** hosted chat-completions API with Gemma. The original stylesheet and dashboard interaction are retained.

## Included

- Email/password account registration and login (bcrypt password hashing, MongoDB-backed sessions).
- Daily check-ins, dashboard, mood trend, gentle rule-based reflections, and user-selected recovery actions.
- Persistent assistant chat, conservative emergency keyword routing, and a fallback if the hosted model is unavailable.
- Optional user-entered health profile and an explicit consent toggle. When enabled, the profile and up to 14 recent check-ins are added to the hosted model prompt to tailor **general wellbeing** suggestions. Consent is off by default.
- CSRF protection, request size limits, and rate limiting on API routes.

## Requirements

- Node.js 18+ (uses native `fetch` and `AbortSignal.timeout`).
- MongoDB Community Edition or a MongoDB Atlas URI.
- A Hugging Face account and access token with **Inference Providers** permission. The project defaults to `google/gemma-2-2b-it:fastest` through `https://router.huggingface.co/v1/chat/completions`. Hugging Face documents this endpoint as OpenAI-compatible for chat completions. Availability, provider routing, and charges depend on the current model/provider settings and account.

## Run locally

1. Extract the archive and open a terminal in the `wellbeing_recovery_ai` project folder.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` (`cp .env.example .env` on macOS/Linux; `copy .env.example .env` in Windows Command Prompt).
4. Edit `.env`. Replace `SESSION_SECRET` with a long random value, set `MONGODB_URI` for your MongoDB server, and replace `HF_TOKEN` with your Hugging Face token. Keep the token only in `.env` on the server; never put it in browser JavaScript or commit it.
5. Confirm MongoDB is running, then start the app with `npm start` (or `npm run dev` during development).
6. Open `http://localhost:3000/register` and create an account. Start with `/checkin`.
7. To permit tailored health-history context, open **Personalization & data**, enter only information you choose to share, then actively enable the consent checkbox. Consent is off by default.

You can change the provider URL through `HF_CHAT_COMPLETIONS_URL` and the model identifier through `HF_GEMMA_MODEL`. A compatible model must be enabled/available to your Hugging Face account. The model is selected server-side; no Hugging Face key is sent to the browser.

## Privacy and safety

Chat messages and recent conversation history are sent to the configured hosted inference service whenever the user sends a message. The profile and up to 14 check-ins are sent only when both the global `HEALTH_CONTEXT_ENABLED=true` setting and the user's explicit consent are active. The service may route requests to inference providers; review Hugging Face's current data, provider, and billing terms before use. Do not enter real patient records or identifying/sensitive information in this prototype.

This is not a medical device, clinical decision-support system, or production patient-record application. Gemma can generate inaccurate or unsafe content. It must not diagnose, prescribe, recommend medication changes, or replace qualified care. Keyword emergency screening is not reliable and is not a substitute for emergency services or human support.

Before real-world deployment, obtain jurisdiction-specific privacy/security and clinical review. Implement encryption in transit and at rest, strict access controls, audit trails, consent/version records, data-minimization, deletion/export/retention controls, backups, monitoring, threat modelling, and incident response. Review model behavior with qualified domain experts before any clinical use.

## Architecture and migration

- **Web/API:** Express routes in `routes/`, EJS pages in `views/`.
- **Persistence:** Mongoose models under `models/`; `connect-mongo` stores sessions in MongoDB.
- **AI:** `routes/api.js` calls Hugging Face's OpenAI-compatible `/v1/chat/completions` route. System instructions request cautious, non-clinical wellbeing education. Model instructions do not guarantee safe output.
- **Personalization:** Prompt-time context only. The prototype does not train a model on individual records and does not claim clinical predictions. Habit/lapse risk modelling is not implemented; future prediction work should begin with transparent, evaluated, non-clinical behavioural indicators.
- **Migration:** The old PHP/MySQL files have been removed. There is no automatic importer for existing MySQL user records; any conversion should use a separately designed, tested, consent-aware process.

## References

- [Hugging Face Inference Providers chat completion docs](https://huggingface.co/docs/inference-providers/en/tasks/chat-completion)
- [Hugging Face Inference Providers overview and OpenAI-compatible endpoint](https://huggingface.co/docs/inference-providers/en/index)
- [Hugging Face Gemma model catalogue](https://huggingface.co/inference/models)
