import axios, { AxiosInstance } from 'axios';
import { XMLParser } from 'fast-xml-parser';
import type {
  Captions,
  CaptionSegment,
  CaptionsOptions,
  CaptionsResponse,
  CaptionTrack,
} from './types';
import {
  CaptionsDisabledError,
  NoCaptionsAvailableError,
  NoCaptionsError,
  VideoNotFoundError,
  YouTubeError,
} from './errors';
import { decodeHtmlEntities, stripHtmlTags } from './utils';

export class CaptionsFetcher {
  private readonly httpClient: AxiosInstance;
  private readonly xmlParser: XMLParser;
  private readonly WATCH_URL = 'https://www.youtube.com/watch?v=';

  constructor() {
    this.httpClient = axios.create();
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
  }

  async getCaptions(videoId: string, options: CaptionsOptions = {}): Promise<Captions> {
    const finalOptions = {
      languages: ['en'],
      ...options,
    };

    const html = await this.fetchVideoHtml(videoId);
    const captionsResponse = this.extractCaptionsData(html, videoId);
    const track = this.findLanguageTrack(
      captionsResponse.playerCaptionsTracklistRenderer.captionTracks,
      finalOptions.languages,
    );

    if (!track) {
      throw new NoCaptionsError(videoId, finalOptions.languages);
    }

    const transcript = await this.fetchCaptionsContent(track);

    return {
      segments: transcript,
      language: track.languageCode,
      videoId,
    };
  }

  private async fetchVideoHtml(videoId: string): Promise<string> {
    try {
      const response = await this.httpClient.get(`${this.WATCH_URL}${videoId}`);
      return response.data;
    } catch (error) {
      throw new VideoNotFoundError(videoId);
    }
  }

  private extractCaptionsData(html: string, videoId: string): CaptionsResponse {
    const captionsMatch = html.split('"captions":');

    if (captionsMatch.length <= 1) {
      if (videoId.startsWith('http')) {
        throw new YouTubeError('Invalid video ID format', videoId);
      }
      if (html.includes('class="g-recaptcha"')) {
        throw new YouTubeError('Too many requests', videoId);
      }
      if (html.includes('unavailable_video.png')) {
        throw new VideoNotFoundError(videoId);
      }
      throw new CaptionsDisabledError(videoId);
    }

    try {
      const captionsJson = JSON.parse(
        captionsMatch[1].split(',"videoDetails')[0].replace(/\n/g, ''),
      );

      if (!captionsJson.playerCaptionsTracklistRenderer) {
        throw new CaptionsDisabledError(videoId);
      }

      if (!captionsJson.playerCaptionsTracklistRenderer.captionTracks) {
        throw new NoCaptionsAvailableError(videoId);
      }

      return captionsJson;
    } catch (error) {
      throw new Error(`Failed to parse captions data: ${(error as Error).message}`);
    }
  }

  private findLanguageTrack(tracks: CaptionTrack[], languages: string[]): CaptionTrack | null {
    for (const lang of languages) {
      const track = tracks.find((t) => t.languageCode === lang);
      if (track) return track;
    }
    return null;
  }

  private async fetchCaptionsContent(track: CaptionTrack): Promise<CaptionSegment[]> {
    const response = await this.httpClient.get(track.baseUrl);
    const parsed = this.xmlParser.parse(response.data);

    return this.parseCaptions(parsed);
  }

  private cleanText(text: string, preserveFormatting: boolean = false): string {
    if (!preserveFormatting) {
      text = stripHtmlTags(text);
    }

    return decodeHtmlEntities(text);
  }

  private parseCaptions(data: any): CaptionSegment[] {
    const transcript = data.transcript;
    if (!transcript || !transcript.text) {
      return [];
    }

    const textElements = Array.isArray(transcript.text) ? transcript.text : [transcript.text];

    return textElements
      .filter((element: any) => element && element['@_start'])
      .map((element: any) => ({
        text: this.cleanText(element['#text'] || '', false),
        start: parseFloat(element['@_start']).toFixed(2),
        duration: parseFloat(element['@_dur'] || '0').toFixed(2),
        end: (parseFloat(element['@_start']) + parseFloat(element['@_dur'] || '0')).toFixed(2),
      }))
      .sort((a: any, b: any) => a.start - b.start);
  }
}
