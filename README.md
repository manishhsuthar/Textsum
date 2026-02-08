# Textsum - File Upload Summarizer

Upload a `.txt` file and get a short summary back in the browser. The server extracts the text and returns a brief, three-sentence summary.

## Features
- Upload `.txt` files from the browser.
- Server-side summarization (top 3 sentences).
- Simple, plain UI with instant summary display.

## Requirements
- Node.js 18+ (works with newer versions too)
- npm

## Install
```bash
npm install
```

If you see a missing module error (like `express`), install dependencies manually:
```bash
npm install express express-fileupload
```

## Run
```bash
npm start
```

Then open:
```
http://localhost:3000
```

## How It Works
- Frontend (`public/index.html`) uploads the file via `fetch`.
- Backend (`server.js`) reads the file contents and generates a short summary.
- The summary is returned as JSON and displayed on the page.

## Project Structure
- `server.js` Express server and summarization logic.
- `public/index.html` UI for upload and summary display.

## Notes
- Only `.txt` files are supported.
- Empty or unreadable files return a clear error message.
