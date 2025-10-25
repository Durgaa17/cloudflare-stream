# cloudflare-stream
plays various media from worker

# Video Stream Proxy Worker

![Banner Image](https://via.placeholder.com/1280x400?text=Video+Stream+Proxy+Worker&bg=007bff&fg=ffffff)  
*(A sleek Cloudflare Worker for streaming videos and playlists – seamless, secure, and device-friendly!)*

---

## 🚀 Welcome to Video Stream Proxy Worker!

Hey there, streamer! 🌟 This project is a powerful **Cloudflare Worker** designed to proxy video streams and M3U playlists, making it super easy to play media content directly in your browser. Whether you're dealing with HLS streams (.m3u8), MP4 videos, or full IPTV playlists (.m3u), this worker handles it all with caching, CORS support, and a user-friendly web interface.

Built with love for **Android TV** and **mobile phones**, it features a responsive UI that lets you load streams or playlists, browse channels, and enjoy fullscreen playback. No more CORS headaches or direct link issues – just pure streaming bliss! 🎥✨

If you're forking this repo, you'll have a ready-to-deploy setup in minutes. Let's dive in!

---

## 📋 What This Project Is About

This Cloudflare Worker acts as a **middleman (proxy)** for video content:
- **Fetches and rewrites M3U playlists** to route streams through itself, bypassing restrictions.
- **Proxies individual streams** (like .ts segments or full videos) with caching for faster loads.
- **Provides a built-in web player** at the root URL, complete with a search bar, playlist channel selector, and HLS support via hls.js.

It's perfect for:
- Personal media servers.
- IPTV enthusiasts.
- Developers building streaming apps.
- Anyone needing a quick proxy for video URLs.

**Key Tech Stack**:
- JavaScript (ES Modules) for Cloudflare Workers.
- HTML/CSS/JS for the frontend UI.
- hls.js for robust HLS playback.
- Cloudflare's caching API for performance.

No external dependencies beyond what's in the code – it's lightweight and self-contained! ⚡

---

## ✨ Features That Shine

- **Universal Stream Proxy**: Handles any video URL via `/proxy?url=your-stream-link`. Supports HLS (.m3u8), MP4, and more – no restrictions!
- **M3U Playlist Magic**: Load playlists with `/?url=your-playlist.m3u`. Automatically rewrites stream URLs to proxy them.
- **Interactive Web UI**:
  - Select "Single Stream" or "M3U Playlist" mode.
  - Enter URL and hit "Load".
  - For playlists: Displays a clickable channel list with titles.
  - Native video player with autoplay, controls, and fullscreen toggle (double-click).
- **Device-Optimized Design**:
  - Responsive for phones (touch-friendly buttons, inline playback).
  - Android TV ready (Enter key support, larger elements for remotes).
- **Performance Boosts**:
  - Caches playlists for 5 minutes and streams for 1 hour.
  - Streams content directly (no buffering delays).
- **Security & Compatibility**:
  - Adds CORS headers for cross-origin playback.
  - User-Agent spoofing to fetch restricted content.
  - Error handling for invalid URLs or fetch failures.

🌈 Pro Tip: This worker turns any public video link into a playable stream – ideal for embedding in apps or sharing!

---

## 🛠 How It Works Under the Hood

1. **Root Path (`/`)**: Serves a beautiful HTML page with the UI. Enter a URL, choose type, load, and play!
2. **Playlist Proxy (`/?url=playlist.m3u`)**: Fetches the M3U, rewrites stream links to `/proxy?url=`, caches it, and returns with proper MIME type.
3. **Stream Proxy (`/proxy?url=stream.ts`)**: Fetches the stream, adds CORS, caches cacheable parts (like .ts segments), and streams back.
4. **UI Logic**:
   - JavaScript fetches playlists via the worker's own endpoint.
   - Parses M3U for channels (using #EXTINF for titles).
   - Uses hls.js for HLS; falls back to native browser support.
   - Handles keyboard (Enter) and double-click (fullscreen) for better UX.

The code is modular: Event listener → Request handler → Specific paths for root, proxy, and playlist.

---

## 📥 Deployment Guide: Step-by-Step Magic

Forked the repo? Awesome! Deploying to Cloudflare is a breeze.Just copy paste on editor.
