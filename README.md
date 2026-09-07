# 📚 Manhwa Tracker

A premium, local-first, offline-ready manga/manhwa tracking application inspired by Mihon. Built with React, TypeScript, Tailwind CSS, and Dexie.js (IndexedDB).

## ✨ Features

- **100% Local & Offline**: Your data stays on your device. No cloud syncing required.
- **Advanced Manual Entry**: Add manhwa with custom covers, detailed metadata, genres, and 18+ content flags.
- **Smart Chapter Management**: Add chapters in bulk (Range, Multiple, or Drag-to-Select) with automatic duplicate detection.
- **Premium Library**: Filter by status, sort by various metrics, and view reading progress at a glance.
- **Secure Vault**: Lock specific manhwa with a PIN code to keep your reading list private.
- **Custom Categories**: Create password-protected custom categories for better organization.
- **Detailed Analytics**: Track your reading streak, weekly goals, genre distribution, and 30-day activity heatmap.
- **Mihon/Tachiyomi Import**: Seamlessly migrate your library and reading history from `.tachibk` or `.proto.gz` backup files.
- **Advanced Rating System**: Rate Story, Art, Characters, and Overall Enjoyment separately.
- **Character Favorites**: Keep track of your favorite male and female characters with custom images.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn or pnpm

### Installation
1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/manhwa-tracker.git
   cd manhwa-tracker
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Database**: Dexie.js (IndexedDB wrapper)
- **Utilities**: JSZip, Pako, Protobuf.js

## 📦 Building for Production
\`\`\`bash
npm run build
\`\`\`
The optimized production build will be generated in the \`dist/\` directory.

## 📄 License
This project is open-source and available under the MIT License.
