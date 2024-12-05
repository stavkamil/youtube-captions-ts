import axios from 'axios';
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { CaptionsDisabledError, VideoNotFoundError, YouTubeError } from '../errors';
import { CaptionsFetcher } from '../captions-fetcher';

vi.mock('axios', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      put: vi.fn(),
      create: vi.fn().mockReturnThis(),
      interceptors: {
        request: {
          use: vi.fn(),
          eject: vi.fn(),
        },
        response: {
          use: vi.fn(),
          eject: vi.fn(),
        },
      },
    },
  };
});

describe('CaptionsFetcher', () => {
  const videoId = 'testVideoId';

  let captionsFetcher: CaptionsFetcher;

  beforeEach(() => {
    captionsFetcher = new CaptionsFetcher();
  });

  it('should fetch valid video HTML with captions', async () => {
    const baseMockHtml = `
    <html>
      <body>
        <script>
          var ytInitialPlayerResponse = {
            "captions": {
              "playerCaptionsTracklistRenderer": {
                "captionTracks": [
                  {
                    "baseUrl": "https://www.youtube.com/api/timedtext?v=testVideoId&lang=en",
                    "name": {
                      "simpleText": "English"
                    },
                    "vssId": "a.en",
                    "languageCode": "en",
                    "kind": "asr",
                    "isTranslatable": true,
                    "trackName": ""
                  }
                ],
                "audioTracks": [
                  {
                    "captionTrackIndices": [0]
                  }
                ],
                "translationLanguages": [
                  {
                    "languageCode": "ab",
                    "languageName": {
                      "simpleText": "Abkhazian"
                    }
                  },
                  {
                    "languageCode": "aa",
                    "languageName": {
                      "simpleText": "Afar"
                    }
                  }
                ]
              }
            }
          };
        </script>
        <h1>My YouTube Video</h1>
        <div id="player"></div>
      </body>
    </html>`;
    (axios.get as MockedFunction<typeof axios.get>).mockResolvedValue({ data: baseMockHtml });
    const html = await captionsFetcher['fetchVideoHtml'](videoId);

    expect(html).toBe(baseMockHtml);
    expect(axios.get).toHaveBeenCalledWith(`https://www.youtube.com/watch?v=${videoId}`);
  });

  it('should throw YouTubeError for too many requests (captcha)', () => {
    const captchaHtml = `
      <html>
        <body>
          <div class="g-recaptcha"></div>
        </body>
      </html>
    `;
    (axios.get as MockedFunction<typeof axios.get>).mockResolvedValue({ data: captchaHtml });

    expect(() => captionsFetcher['extractCaptionsData'](captchaHtml, videoId)).toThrow(
      YouTubeError,
    );
  });

  it('should throw VideoNotFoundError for unavailable video', () => {
    const unavailableVideoHtml = `
        <html>
          <body>
            <img src="unavailable_video.png" />
          </body>
        </html>
      `;
    (axios.get as MockedFunction<typeof axios.get>).mockResolvedValue({
      data: unavailableVideoHtml,
    });

    expect(() => captionsFetcher['extractCaptionsData'](unavailableVideoHtml, videoId)).toThrow(
      VideoNotFoundError,
    );
  });

  it('should throw CaptionsDisabledError for video with captions disabled', () => {
    const captionsDisabledHtml = `
        <html>
          <body>
            <script>
              var ytInitialPlayerResponse = {};
            </script>
          </body>
        </html>
      `;
    (axios.get as MockedFunction<typeof axios.get>).mockResolvedValue({
      data: captionsDisabledHtml,
    });

    expect(() => captionsFetcher['extractCaptionsData'](captionsDisabledHtml, videoId)).toThrow(
      CaptionsDisabledError,
    );
  });
});
