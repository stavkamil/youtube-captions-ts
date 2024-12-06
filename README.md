![Youtube Captions TS Logo](public/logo.png)

TypeScript library for fetching and parsing YouTube video captions with full type safety.

![npm](https://img.shields.io/npm/v/youtube-captions-ts)
![install size](https://packagephobia.com/badge?p=youtube-captions-ts)
![downloads](https://img.shields.io/npm/dm/youtube-captions-ts)

## Installation

```bash
npm install youtube-captions-ts
# or
yarn add youtube-captions-ts
```

## Quick Start

```typescript
import { fetcher } from 'youtube-captions-ts';

async function getCaptions() {
  try {
    const captions = await fetcher.getCaptions('YOUTUBE_VIDEO_ID');
    console.log(captions);
  } catch (error) {
    console.error('Error fetching captions:', error);
  }
}
```

## API Reference

### getCaptions(videoId: string, options?: CaptionsOptions): Promise<Captions>

Fetches and parses captions for a YouTube video.

#### Parameters

- `videoId`: YouTube video ID
- `options`: Optional configuration object
  - `languages`: Array of language codes (default: ['en'])
  - more features soon...

#### Return Type

```typescript
interface Captions {
  segments: CaptionSegment[];
  language: string;
  videoId: string;
}

interface CaptionSegment {
  text: string;
  start: number;
  duration: number;
}
```
