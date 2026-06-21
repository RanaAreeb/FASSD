# Security checklist (FASSD demo)

## Inference API (`new backend/release/`)

- Set `REQUIRE_INFERENCE_AUTH=true` in production.
- Set `FIREBASE_PROJECT_ID` to your Firebase project ID.
- Set `INFERENCE_API_KEY` on the Droplet **and** the same value on Vercel for the proxy.
- Set `CORS_ALLOW_ORIGINS` to your frontend domains only (no `*`).
- Keep port `8000` on localhost; expose only Caddy HTTPS (443).
- Keep `ENABLE_ANALYSIS_REPORTS=true` so the dashboard can offer PDF/JSON downloads.
- Install `reportlab` in the backend venv for real PDF output (`pip install reportlab`).

## Vercel (Next.js)

- Set `INFERENCE_PROXY_TARGET` to your API URL.
- Set `INFERENCE_API_KEY` (server-only — never `NEXT_PUBLIC_*`).

## Firebase

```bash
firebase deploy --only firestore:rules,storage
```

- Firestore: users only access their own documents.
- Storage: users only write `avatars/{uid}.*` under 2 MB.
- Add production domains in Firebase Console → Authentication → Authorized domains.

## Upload limits

- Client: `lib/upload-limits.ts` (50 MB, audio extensions).
- Server: `MAX_UPLOAD_BYTES` in `src/security.py`.

## Analyze auth

Signed-in users send `Authorization: Bearer <Firebase ID token>`.
The API verifies the token via Firebase JWKS.
