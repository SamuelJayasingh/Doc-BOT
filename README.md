# Doc-BOT Frontend

The Doc-BOT frontend is a Next.js application that provides a responsive chat interface, audio capture and playback, and seamless integration with the Doc-BOT backend API.

---

## Table of Contents

1. [Features](#features)  
2. [Technology Stack](#technology-stack)  
3. [Repository Structure](#repository-structure)  
4. [Prerequisites](#prerequisites)  
5. [Environment Variables](#environment-variables)  
6. [Installation](#installation)  
7. [Running Locally](#running-locally)  
8. [API Integration](#api-integration)  
9. [Building for Production](#building-for-production)  
10. [Contribution](#contribution)  
11. [License](#license)  

---

## Features

- Text-based chat interface with real-time AI responses  
- Audio recording for voice input and playback of AI TTS responses  
- Conversation history management  
- Responsive design for desktop and mobile  
- Error handling and user feedback on API failures  

---

## Technology Stack

- Framework: Next.js  
- Language: JavaScript (ES6+) / TypeScript (optional)  
- Styling: CSS Modules or Tailwind CSS  
- Data Fetching: SWR (stale-while-revalidate)  
- Audio: Web Audio API, MediaRecorder API  

---

## Repository Structure

```

frontend/
├── .next/               # Next.js build output
├── node\_modules/        # Dependencies
├── public/              # Static assets (icons, fonts, etc.)
├── src/
│   ├── pages/           # Next.js pages (index.js, \_app.js, api routes if any)
│   ├── styles/          # CSS Modules or global styles
│   └── ...              # components/, hooks/, utils/, etc.
├── .gitignore
├── jsconfig.json
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.js
└── README.md

````

---

## Prerequisites

- Node.js v16 or higher  
- npm, Yarn, or pnpm  
- Doc-BOT backend API running and accessible  

---

## Environment Variables

Create a file named `.env.local` in the `frontend/` directory:

```ini
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
````

* `NEXT_PUBLIC_API_BASE_URL`: Base URL for the Doc-BOT backend (must start with `NEXT_PUBLIC_` to be exposed to the browser).

Do not commit this file; use environment management for production.

---

## Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

   or

   ```bash
   pnpm install
   ```

---

## Running Locally

Start the development server:

```bash
npm run dev
```

or

```bash
yarn dev
```

or

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Integration

The frontend communicates with the backend via REST endpoints:

* **POST** `/chat`
  Request body:

  ```json
  { "text": "<user message>", "history": "<conversation history>" }
  ```

  Response:

  ```json
  { "response": "<AI reply>" }
  ```

* **POST** `/tts`
  Request body:

  ```json
  { "text": "<user message>", "history": "<conversation history>" }
  ```

  Response: MPEG audio stream + `X-AI-Response` header

* **POST** `/transcribe`
  FormData with `audio` (File) and optional `history`
  Response: MPEG audio stream + `X-Transcribed-Text` and `X-AI-Response-Text` headers

Configure the base URL in your API client (e.g. `src/utils/apiClient.js`) to prepend `process.env.NEXT_PUBLIC_API_BASE_URL` to all requests.

---

## Building for Production

Generate an optimized production build:

```bash
npm run build
```

or

```bash
yarn build
```

Start the production server (if using Next.js custom server):

```bash
npm start
```

or

```bash
yarn start
```

---

## Contribution

* If you have any suggestions to this README or about the Script, feel free to inform me. And if you liked, you are free to use it for yourself.(P.S. Star it too!! 😬 )

* Your Contributions are much welcomed here!

  > Fork the project
  >
  > > Compile your work
  > >
  > > > Call in for a Pull Request

Credits: [Samuel Jayasingh](https://github.com/SamuelJayasingh)

Last Edited on: 19/05/2025

---

## License

This project is licensed under the MIT License. See [LICENSE](../LICENSE) for details.
