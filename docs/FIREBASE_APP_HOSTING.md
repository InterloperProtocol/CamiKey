# Firebase App Hosting Deployment

This repo is configured to deploy as a Next.js app on Firebase App Hosting.

## What Is Already Wired Up

- `apphosting.yaml` defines the runtime secrets App Hosting should inject.
- `firebase-admin` initializes with the active Firebase project ID from App Hosting / Firebase env.
- Stream registration now derives its public origin from the incoming request, so generated
  streamer and overlay URLs match the deployed App Hosting domain instead of `localhost`.

## Required Secrets

Create these App Hosting secrets before your first production rollout:

- `SOLANA_RPC_URL`
- `PLATFORM_TREASURY`
- `PAYMENT_ENCRYPTION_KEY`
- `CRON_SECRET`

## Deploy Checklist

1. Install dependencies with `npm install`.
2. Verify the app locally with `npm run build`, `npm run typecheck`, `npm run lint`, and `npm test`.
3. Make sure Firestore is enabled in the Firebase project and deploy rules/indexes:
   - `firebase deploy --only firestore:rules`
   - `firebase deploy --only firestore:indexes`
4. Create or connect an App Hosting backend in Firebase Console or with the Firebase CLI.
5. Add the required secrets to that backend.
6. Deploy the backend from Firebase App Hosting.

## Notes

- `POST /api/scheduler/run` and `POST /api/live-index/run` still need an external trigger such as
  Cloud Scheduler, GitHub Actions, or another cron service.
- If you attach a custom domain later, generated registration URLs will automatically follow it
  because the API now uses the request origin instead of a hardcoded app URL.
