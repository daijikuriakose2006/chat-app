# Ember Chat App Clone

A real-time chat application inspired by Ember Chat (WhatsApp Web style design) built with React.js, Tailwind CSS, and Firebase.

## Key Features
- **Real-Time Chat**: Messages update instantly across all connected screens.
- **Room Creation & Join Flows**:
  - **Create Room**: Select either Public or Private. Private rooms require a password.
  - **Join Room**: Enter the exact name of the room. Public rooms are entered instantly; private rooms prompt for a password. If a room doesn't exist, a toast message is shown.
- **Full Authentication**: Email & Password registration, Login, and Google Sign-in.
- **Custom Customizations**: Light/Dark mode toggles, custom scrollbars, edit/delete your own messages, real-time typing indicators, and built-in inline emoji picker.

---

## 🛠️ Local Setup Instructions

### 1. Configure Firebase Credentials (Manual Database Connection)
Copy `.env.example` to a new file named `.env` in the root directory:
```bash
cp .env.example .env
```
Fill in the values using your Firebase Web App credentials (available in the Firebase Console):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### 2. Configure Firebase Console
1. **Authentication**: Enable both **Email/Password** and **Google** sign-in providers in the Firebase Auth settings.
2. **Cloud Firestore**: Enable Cloud Firestore and set up databases.
3. **Firestore Security Rules**: Copy the content of `firestore.rules` from this repository to your Firebase Console under the "Rules" tab.

### 3. Run Locally
Install dependencies and start the development server:
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deploy to Vercel

This project is configured out-of-the-box for production Vercel deployment:

1. Push your codebase to a GitHub, GitLab, or Bitbucket repository.
2. Link it in Vercel: Import the project using Vercel Dashboard.
3. Configure environment variables: Add the same `VITE_FIREBASE_...` keys from your `.env` file under **Project Settings > Environment Variables**.
4. Deploy! Vercel will automatically compile the bundle using `npm run build` and route requests through `vercel.json`.
