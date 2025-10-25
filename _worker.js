addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const targetUrl = url.searchParams.get('url');
  const cache = caches.default;

  // Root path: Return HTML with search bar, type select, load button, channel list, and video player
  if (pathname === '/' && !targetUrl) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Video Stream Player</title>
        <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background-color: #f0f0f0; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: flex-start; 
            min-height: 100vh; 
            box-sizing: border-box;
          }
          h1 { 
            font-size: 2em; 
            text-align: center; 
            margin-bottom: 20px; 
          }
          #search-bar { 
            display: flex; 
            width: 100%; 
            max-width: 800px; 
            margin-bottom: 20px; 
          }
          #type-select {
            padding: 15px;
            font-size: 1.2em;
            border: 2px solid #ccc;
            border-radius: 5px 0 0 5px;
            background-color: white;
          }
          #url-input { 
            flex: 1; 
            padding: 15px; 
            font-size: 1.2em; 
            border: 2px solid #ccc;
            border-left: none;
          }
          #load-button { 
            padding: 15px 30px; 
            font-size: 1.2em; 
            background-color: #007bff; 
            color: white; 
            border: none; 
            border-radius: 0 5px 5px 0; 
            cursor: pointer; 
            transition: background-color 0.3s; 
          }
          #load-button:hover, #load-button:focus { 
            background-color: #0056b3; 
          }
          #channel-list {
            list-style: none;
            padding: 0;
            width: 100%;
            max-width: 800px;
            margin-bottom: 20px;
          }
          #channel-list li {
            padding: 15px;
            margin-bottom: 10px;
            background-color: white;
            border: 2px solid #ccc;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1.2em;
            transition: background-color 0.3s;
          }
          #channel-list li:hover, #channel-list li:focus {
            background-color: #e0e0e0;
          }
          #video-player { 
            width: 100%; 
            max-width: 800px; 
            height: auto; 
            border: 2px solid #ccc; 
            border-radius: 5px; 
          }
          @media (max-width: 600px) { 
            body { padding: 10px; } 
            h1 { font-size: 1.5em; } 
            #type-select, #url-input, #load-button { font-size: 1em; padding: 10px; } 
            #channel-list li { font-size: 1em; padding: 10px; }
          }
          @media (min-width: 1200px) { 
            h1 { font-size: 2.5em; } 
            #type-select, #url-input, #load-button { font-size: 1.5em; padding: 20px; } 
            #channel-list li { font-size: 1.5em; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>Video Stream Player</h1>
        <div id="search-bar">
          <select id="type-select">
            <option value="single">Single Stream</option>
            <option value="playlist">M3U Playlist</option>
          </select>
          <input type="text" id="url-input" placeholder="Enter URL (e.g., .m3u8, .mp4, or .m3u)">
          <button id="load-button">Load</button>
        </div>
        <ul id="channel-list"></ul>
        <video id="video-player" controls playsinline></video>

        <script>
          const loadButton = document.getElementById('load-button');
          const typeSelect = document.getElementById('type-select');
          const urlInput = document.getElementById('url-input');
          const channelList = document.getElementById('channel-list');
          const video = document.getElementById('video-player');
          let hls;

          function playStream(streamUrl) {
            if (hls) {
              hls.destroy();
            }
            if (Hls.isSupported()) {
              hls = new Hls();
              hls.loadSource(streamUrl);
              hls.attachMedia(video);
              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(error => console.error('Playback error:', error));
              });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = streamUrl;
              video.addEventListener('loadedmetadata', () => {
                video.play().catch(error => console.error('Playback error:', error));
              });
            } else {
              console.error('HLS is not supported in this browser.');
              alert('HLS playback is not supported in this browser.');
            }
          }

          function displayChannels(channels) {
            channelList.innerHTML = '';
            channels.forEach(channel => {
              const li = document.createElement('li');
              li.textContent = channel.title;
              li.addEventListener('click', () => playStream(channel.url));
              channelList.appendChild(li);
            });
          }

          async function loadContent() {
            const inputUrl = urlInput.value.trim();
            const type = typeSelect.value;
            if (!inputUrl) {
              alert('Please enter a valid URL.');
              return;
            }
            channelList.innerHTML = ''; // Clear previous list
            video.pause(); // Stop current playback

            if (type === 'single') {
              const proxyUrl = '/proxy?url=' + encodeURIComponent(inputUrl);
              playStream(proxyUrl);
            } else if (type === 'playlist') {
              const playlistProxyUrl = '/?url=' + encodeURIComponent(inputUrl);
              try {
                const response = await fetch(playlistProxyUrl);
                if (!response.ok) {
                  throw new Error('Failed to fetch playlist.');
                }
                const body = await response.text();
                const lines = body.split('\\n');
                const channels = [];
                let currentTitle = null;
                lines.forEach(line => {
                  line = line.trim();
                  if (line.startsWith('#EXTINF:')) {
                    const parts = line.substring(8).split(',');
                    if (parts.length > 1) {
                      currentTitle = parts.slice(1).join(',').trim();
                    } else {
                      currentTitle = 'Untitled';
                    }
                  } else if (line && !line.startsWith('#') && currentTitle) {
                    channels.push({ title: currentTitle, url: line });
                    currentTitle = null;
                  }
                });
                if (channels.length === 0) {
                  alert('No channels found in the playlist.');
                } else {
                  displayChannels(channels);
                }
              } catch (error) {
                console.error('Error loading playlist:', error);
                alert('Error loading playlist: ' + error.message);
              }
            }
          }

          loadButton.addEventListener('click', loadContent);

          // Support for Enter key on input
          urlInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              loadContent();
            }
          });

          // Fullscreen toggle
          video.addEventListener('dblclick', () => {
            if (video.requestFullscreen) {
              video.requestFullscreen();
            } else if (video.webkitRequestFullscreen) {
              video.webkitRequestFullscreen();
            }
          });
        </script>
      </body>
      </html>
    `;
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  // Proxy for streams: /proxy?url=stream_link (no restrictions)
  if (pathname === '/proxy' && targetUrl) {
    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);

    if (!response) {
      try {
        // Fetch the stream with streaming enabled
        response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; M3U Proxy)'
          }
        });

        if (!response.ok) {
          return new Response('Failed to fetch stream.', { status: response.status });
        }

        // Clone and cache the response (for cacheable content like .ts, .mp4, etc.)
        const clonedResponse = response.clone();
        const headers = new Headers(clonedResponse.headers);
        headers.set('Cache-Control', 'public, max-age=3600'); // Cache streams for 1 hour
        const cacheResponse = new Response(clonedResponse.body, { headers });

        // Cache asynchronously
        event.waitUntil(cache.put(cacheKey, cacheResponse));

        // Return the original response for streaming
        const streamHeaders = new Headers(response.headers);
        streamHeaders.set('Access-Control-Allow-Origin', '*');
        // Preserve the original Content-Type for video streams
        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
        streamHeaders.set('Content-Type', contentType);
        return new Response(response.body, {
          status: response.status,
          headers: streamHeaders
        });
      } catch (error) {
        return new Response('Error proxying stream: ' + error.message, { status: 500 });
      }
    }

    // If cached, return with CORS
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, { headers });
  }

  // M3U Playlist proxy: ?url=any_m3u_link
  if (targetUrl && (pathname === '/' || pathname === '')) {
    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);

    if (!response) {
      try {
        // Fetch M3U from any source
        const fetchResponse = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; M3U Proxy)'
          }
        });

        if (!fetchResponse.ok) {
          return new Response('Failed to fetch playlist.', { status: fetchResponse.status });
        }

        let body = await fetchResponse.text();

        // Rewrite all stream URLs to proxy through Worker
        body = body.replace(
          /(http[^\s]+)/g,
          (match) => `${url.origin}/proxy?url=${encodeURIComponent(match)}`
        );

        // Create response with rewritten body
        response = new Response(body, fetchResponse);

        // Add Cache-Control for M3U (5 minutes)
        response.headers.set('Cache-Control', 'public, max-age=300');

        // Cache asynchronously
        event.waitUntil(cache.put(cacheKey, response.clone()));
      } catch (error) {
        return new Response('Error proxying playlist: ' + error.message, { status: 500 });
      }
    }

    // Add CORS and MIME type
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/vnd.apple.mpegurl');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, { headers });
  }

  // Fallback for invalid requests
  return new Response('Invalid request. Use ?url= for playlist or /proxy?url= for streams.', { status: 400 });
}
