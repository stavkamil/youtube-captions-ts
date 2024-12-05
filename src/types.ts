export interface CaptionsOptions {
  languages?: string[]; // e.g., ['en', 'es'] - will try in order
}

export interface CaptionSegment {
  text: string;
  start: number;
  duration: number;
}

export interface Captions {
  segments: CaptionSegment[];
  language: string;
  videoId: string;
}

export interface CaptionTrack {
  baseUrl: string;
  name: {
    simpleText: string;
  };
  languageCode: string;
  kind?: string;
  isTranslatable?: boolean;
}

export interface CaptionsResponse {
  playerCaptionsTracklistRenderer: {
    captionTracks: CaptionTrack[];
  };
}
