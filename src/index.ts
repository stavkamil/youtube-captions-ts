import { CaptionsFetcher } from './captions-fetcher';
import { VideoNotFoundError } from './errors';

async function test() {
  const fetcher = new CaptionsFetcher();

  try {
    // Test 1: Basic usage with a real video (this is a short YouTube video with English captions)
    console.log('\nTest 1: Fetching English transcript');
    const transcript = await fetcher.getTranscript('G5u_46C0xzU');
    console.log('Success! First segment:', transcript.segments[0]);
    console.log('Language:', transcript.language);
    console.log('Total segments:', transcript.segments.length);
    // Test 2: Try with Spanish preference, falling back to English
    // console.log('\nTest 2: Testing language fallback');
    // const spanishTranscript = await fetcher.getTranscript('nkqQfABopyc', {
    //   languages: ['es', 'en'],
    // });
    // console.log('Language found:', spanishTranscript.language);
    // Test 3: Invalid video ID (should throw VideoNotFoundError)
    // console.log('\nTest 3: Testing invalid video ID');
    // try {
    //   await fetcher.getTranscript('invalid-id');
    // } catch (error) {
    //   if (error instanceof VideoNotFoundError) {
    //     console.log('Successfully caught VideoNotFoundError:', error.message);
    //   } else {
    //     throw error;
    //   }
    // }
    // Test 4: Request unavailable language (should throw NoTranscriptError)
    //   console.log('\nTest 4: Testing unavailable language');
    //   try {
    //     await fetcher.getTranscript('nkqQfABopyc', {
    //       languages: ['ja'], // assuming the video doesn't have Japanese captions
    //     });
    //   } catch (error) {
    //     if (error instanceof NoTranscriptError) {
    //       console.log('Successfully caught NoTranscriptError:', error.message);
    //     } else {
    //       throw error;
    //     }
    //   }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

test();
