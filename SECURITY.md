# Security checklist (FASSD demo)

## Inference API (`new backend/release/`)

- Set `REQUIRE_INFERENCE_AUTH=true` in production.
- Set `FIREBASE_PROJECT_ID` to your Firebase project ID.
- Set `INFERENCE_API_KEY` on the Droplet **and** the same value on Vercel for the proxy.
- Keep `REQUIRE_VERIFIED_EMAIL_FOR_BEARER=true` so Firebase Bearer tokens from email/password users must be verified before inference.
- Set `CORS_ALLOW_ORIGINS` to your frontend domains only (no `*`).
- Keep port `8000` on localhost; expose only Caddy HTTPS (443).
- Keep `ENABLE_ANALYSIS_REPORTS=true` so the dashboard can offer PDF/JSON downloads.
- Install `reportlab` in the backend venv for real PDF output (`pip install reportlab`).
- Install/keep `ffmpeg` on the backend host for MP3/M4A/WebM and WhatsApp `.amr`/`.3gp` decoding.

## Vercel (Next.js)

- Set `INFERENCE_PROXY_TARGET` to your API URL.
- Set `INFERENCE_API_KEY` (server-only — never `NEXT_PUBLIC_*`).
- The inference proxy only allows known paths and requires a Firebase `Authorization: Bearer <ID token>` header for analysis/report routes.

## Firebase

```bash
firebase deploy --only firestore:rules,storage
```

- Firestore: users can create their own profile at signup; verified users can only read/write their own profile and analysis history.
- Storage: verified users only write `avatars/{uid}.*` under 2 MB with image content types.
- Add production domains in Firebase Console → Authentication → Authorized domains.
- Email/password signups receive a verification email and are blocked from protected app routes until `emailVerified=true`.
- Google sign-in remains available; Google-provider emails are already verified by the identity provider.

## Upload limits

- Client: `lib/upload-limits.ts` (50 MB, allowed audio extensions, 5s–5min metadata check where browsers support it).
- Server: `MAX_UPLOAD_BYTES` in `src/security.py`; duration/silence/non-speech gates in `src/audio_quality.py`.
- Unsupported panel-test inputs return `processing_status=invalid_input` instead of a fake/real verdict.

## Analyze auth

Signed-in users send `Authorization: Bearer <Firebase ID token>`.
The API verifies the token via Firebase JWKS.
If `REQUIRE_VERIFIED_EMAIL_FOR_BEARER=true`, unverified email/password tokens are rejected before inference.

## Panel-ready answers

- **Animal voices, ringtones, tones, and silence:** rejected before inference. Animal/non-human audio returns `invalid_input_code=animal_voice` with an explicit out-of-scope message; other invalid inputs use `non_speech`, `silence`, etc.
- **Very short audio:** blocked below `MIN_AUDIO_DURATION_SEC` (default 5 seconds), because the model needs enough speech context.
- **Very large or long audio:** upload bytes are capped at 50 MB and duration is capped at 5 minutes by default to avoid memory/time crashes.
- **WhatsApp AMR/3GP:** accepted by extension and decoded through `ffmpeg`; if decoding fails, the user receives a clear unsupported-codec message.
- **Can one user read another user’s database records?** No. Firestore rules compare `request.auth.uid` to the document owner field.
- **Can someone avoid Google for security reasons?** Yes. Email/password is supported, but dashboard access requires email verification.
- **Do only valid emails create accounts?** Firebase creates the auth record, sends a verification email, and the app blocks protected features until the email owner clicks the verification link.
