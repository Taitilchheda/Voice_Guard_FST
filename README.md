# Voice Guard – Deepfake Analysis Suite

Voice Guard is a full-stack toolkit for detecting, generating, and securing audio content. The frontend delivers an interactive dashboard for uploads, live microphone recordings, QR-code verification, and reporting. The backend exposes authentication, secure storage, and a deepfake detector that now relies on a pretrained Hugging Face model.

## Features
- Real-time upload & microphone analysis flows with detailed feature breakdowns.
- Deepfake detection powered by `MelodyMachine/Deepfake-audio-detection-V2` (or any Hugging Face audio-classification model of your choice).
- Authenticated upload->QR workflow backed by MongoDB/GridFS.
- Report sharing via PDF export, e-mail, or WhatsApp links.
- Ready for static hosting on Vercel/Netlify with runtime API base URL configuration.

## Tech Stack
| Area      | Technologies |
|-----------|--------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind, Framer Motion, MUI |
| Auth/File API | Node.js, Express, MongoDB/Mongoose, GridFS |
| Detection API | Flask, Flask-JWT-Extended, Hugging Face transformers |

## Project Layout
```
backend/                # Flask API (app.py) + Express/Mongo services
src/                    # React application (Vite)
ML/New/                 # CSV data + QR tooling
requirements.txt        # Python backend dependencies
```

## Backend Setup (Flask detector)
```bash
python -m venv .venv && source .venv/bin/activate  # or use your preferred env
pip install -r requirements.txt
```
Create `backend/.env` (or export the values before running) with:
```
MONGODB_URI=mongodb://127.0.0.1:27017/voice_guard
MONGODB_DB_NAME=voice_guard
MONGODB_AUDIO_COLLECTION_NAME=audio_files
JWT_SECRET=super-secret-key
DEEPFAKE_MODEL_ID=MelodyMachine/Deepfake-audio-detection-V2
EMAIL_SENDER=you@example.com
EMAIL_PASSWORD=app-specific-password
```
> You can swap `DEEPFAKE_MODEL_ID` for any Hugging Face audio-classification checkpoint that outputs `real`/`fake` style labels.

Then run the API:
```bash
python backend/app.py
```
The detector exposes `POST /api/audio/analyze` for inference and `POST /api/audio/upload` for QR-code generation.

## Backend Setup (Node auth/upload service)
```bash
cd backend
npm install
node server.js
```
Environment variables used by the Express service:
```
MONGODB_URI=...
JWT_SECRET=...
```
The service hosts `/auth/*` and `/audio/*` endpoints and relies on the shared MongoDB instance.

## Frontend Setup
```bash
npm install
npm run dev
```
Create `src/.env` or `.env.local` in the project root with:
```
VITE_API_BASE_URL=http://127.0.0.1:5000
```
Deployments on Vercel/Netlify should set `VITE_API_BASE_URL` to the externally reachable Flask backend URL. Build using `npm run build` and point Vercel/Netlify to the `dist` folder.

## Deployment Notes
1. **Frontend (Vercel/Netlify):**
   - set `VITE_API_BASE_URL` in the hosting dashboard.
   - run the default Vite build command (`npm run build`).
2. **Backend (Flask):**
   - host on Render/Railway/EC2/etc. Running via `gunicorn backend.app:app` is production ready.
   - ensure system packages for `librosa` (ffmpeg/libsndfile) are available on the target image.
3. **MongoDB:** can be a managed Atlas cluster; update `MONGODB_URI` accordingly.

## Hugging Face Model
- The detector loads the model once during startup. If the environment cannot download weights, set `HF_HOME` or mount a cache with the model to avoid repeated downloads.
- To switch models, change `DEEPFAKE_MODEL_ID` (no code change required).

## Testing & Linting
- Frontend: `npm run lint` (ESLint) and `npm run build`.
- Backend: add unit tests as needed; the Flask service surfaces structured HTTP errors for integration tests.

## Troubleshooting
- **Model fails to load:** check the console log from `backend/app.py`. The API returns `503` with `details` when the Hugging Face pipeline cannot initialize.
- **Microphone analysis is always real:** this is intentional for the live-recording UX as requested; uploaded files still use the Hugging Face detector.
- **WSL1 warning:** Node.js tooling requires WSL2 for hardware access. Upgrade the subsystem or run commands from a native environment.
