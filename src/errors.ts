export class CaptionsError extends Error {
  constructor(
    message: string,
    public videoId: string,
  ) {
    super(message);
    this.name = 'CaptionsError';
  }
}

export class NoCaptionsError extends CaptionsError {
  constructor(videoId: string, languages: string[]) {
    super(`No captions found for video ${videoId} in languages: ${languages.join(', ')}`, videoId);
    this.name = 'NoCaptionsError';
  }
}

export class VideoNotFoundError extends CaptionsError {
  constructor(videoId: string) {
    super(`Video ${videoId} not found or is unavailable`, videoId);
    this.name = 'VideoNotFoundError';
  }
}

export class CaptionsDisabledError extends CaptionsError {
  constructor(videoId: string) {
    super('Captions are disabled for this video', videoId);
    this.name = 'CaptionsDisabledError';
  }
}

export class NoCaptionsAvailableError extends CaptionsError {
  constructor(videoId: string) {
    super('No captions available for this video', videoId);
    this.name = 'NoCaptionsAvailableError';
  }
}

export class YouTubeError extends CaptionsError {
  constructor(message: string, videoId: string) {
    super(message, videoId);
    this.name = 'YouTubeError';
  }
}
