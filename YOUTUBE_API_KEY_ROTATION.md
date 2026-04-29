# YouTube API Key Rotation System

## Overview
The YouTube API key rotation system automatically switches between multiple API keys when one reaches its quota limit. This ensures uninterrupted video search functionality for ANY concept.

## How It Works

### 1. Multiple API Keys Configuration
In `.env.local`, you can add multiple YouTube API keys separated by commas:

```env
YOUTUBE_API_KEY=AIzaSyAzwBFjf6Yla2Td9ngor9jTFjBiv36IMGU, AIzaSyBF-CsQoCqET79GtfFy3y-pKx89KmNLkH4
```

### 2. Automatic Key Rotation
When a YouTube API request fails with:
- **403 Forbidden** (quota exceeded)
- **429 Too Many Requests** (rate limit)

The system automatically:
1. Logs the quota exhaustion
2. Rotates to the next available API key
3. Retries the same request with the new key
4. Continues searching until a video is found or all keys are exhausted

### 3. Functions with Key Rotation

All YouTube API functions now support automatic key rotation:

#### `searchInChannel()`
- Searches within specific animation channels (Dr. Binocs, TED-Ed, Kurzgesagt, etc.)
- Automatically rotates keys on quota errors
- Retries once with the next key

#### `searchYouTubeGeneral()`
- Fallback general YouTube search
- Searches for "animation explained" videos
- Automatically rotates keys on quota errors

#### `fetchVideoDetails()`
- Gets video duration and description for smart timestamps
- Automatically rotates keys on quota errors

### 4. Search Strategy for ANY Concept

The system uses a multi-tier approach to find videos for ANY topic:

**Tier 1: Pure Animation Channels (Highest Priority)**
- Dr. Binocs (Peekaboo Kidz)
- TED-Ed
- Kurzgesagt
- MinuteEarth
- MinutePhysics
- Primer

**Tier 2: Mostly Animated Channels**
- SciShow Kids
- It's AumSum Time
- The Infographics Show
- CrashCourse Kids
- AsapSCIENCE
- Stated Clearly

**Tier 3: General Search Fallback**
- If no results from animation channels, searches all of YouTube
- Filters for educational animated content
- Still prefers animation channels in ranking

### 5. AI-Powered Keyword Extraction

For ANY concept the teacher speaks, the system:
1. Uses Gemini AI to extract clean educational keywords
2. Removes filler words, speech errors, repetitions
3. Generates 2-4 word search queries

**Examples:**
- "photosynthesis" → "photosynthesis"
- "wassup how does mitosis work" → "mitosis cell division"
- "newton laws of motion bro" → "newton laws motion"
- "tell me about the digestive system" → "digestive system"

### 6. Smart Video Selection

After finding candidates, Gemini AI:
1. Analyzes all video titles and descriptions
2. Ranks by animation quality (tier 1 > tier 2 > tier 3)
3. Picks the most topic-relevant video
4. Ensures suitability for deaf students

### 7. Smart Timestamps

The system automatically:
1. Parses YouTube chapter markers from video descriptions
2. Skips intro/outro/credits chapters
3. Finds the core concept explanation
4. Sets start/end times to show only relevant content
5. Never plays into end cards or credits

## Testing the System

### Test Different Concepts

Try these diverse topics to verify it works for ANY concept:

**Science:**
- "photosynthesis"
- "water cycle"
- "solar system"
- "cell division"
- "gravity"

**Math:**
- "fractions"
- "pythagorean theorem"
- "quadratic equations"
- "geometry"

**History:**
- "world war 2"
- "ancient egypt"
- "industrial revolution"

**Geography:**
- "continents"
- "volcanoes"
- "climate zones"

**Language:**
- "parts of speech"
- "grammar rules"
- "punctuation"

### Expected Behavior

For each concept, the system should:
1. Extract clean keywords using AI
2. Search animation channels first
3. Fall back to general search if needed
4. Rotate API keys automatically on quota errors
5. Return a video with smart timestamps
6. Log all steps in the console

## Console Logs

Watch for these log messages:

```
[YouTube] Finding ANIMATED video for: "photosynthesis" (2 API keys available)
[YouTube] Keyword: "photosynthesis"
[YouTube] Searching 6 Tier 1 animation channels for: "photosynthesis"
[YouTube] Found 8 results from Tier 1 animation channels
[YouTube] AI picked: "Photosynthesis | The Dr. Binocs Show" (Peekaboo Kidz, tier 1)
[YouTube] Selected: "Photosynthesis | The Dr. Binocs Show" by Peekaboo Kidz (abc123)
[YouTube] Smart trim: "Main Content" → 10s – 180s (creditsBuffer=25s, totalDur=240s)
```

If a key is exhausted:
```
[YouTube] API key quota exceeded, rotating to next key
[YouTube] Rotated to API key 2/2
```

## Troubleshooting

### No Videos Found

If no videos are found for a concept:

1. **Check API Keys**: Ensure both keys are valid in `.env.local`
2. **Check Console**: Look for error messages
3. **Try Different Keywords**: The AI might need better context
4. **Check Quota**: Both keys might be exhausted (wait 24 hours)

### Videos Not Relevant

If videos don't match the topic:

1. **Add Subject Context**: Pass `subject` parameter (e.g., "Science", "Math")
2. **Add Chapter Context**: Pass `chapter` parameter for more specificity
3. **Check Keyword Extraction**: Look at console logs for extracted keywords

### API Key Rotation Not Working

If rotation fails:

1. **Check Key Format**: Keys must be comma-separated in `.env.local`
2. **Check Key Validity**: Test each key individually on YouTube API console
3. **Check Error Codes**: Only 403/429 trigger rotation
4. **Restart Server**: Changes to `.env.local` require server restart

## API Quota Limits

**YouTube Data API v3 Free Tier:**
- 10,000 units per day per key
- Search costs 100 units per request
- Video details costs 1 unit per request
- ~100 searches per day per key

**With 2 Keys:**
- ~200 searches per day total
- Automatic rotation ensures continuous service

## Production Recommendations

1. **Use 3+ API Keys**: More keys = more daily quota
2. **Monitor Usage**: Track which keys are being used
3. **Set Up Alerts**: Get notified when all keys are exhausted
4. **Cache Results**: Store video results to reduce API calls
5. **Rate Limiting**: Limit searches per user per day

## Code Reference

All YouTube API logic is in: `lib/youtube-video.ts`

Key functions:
- `getYouTubeApiKey()` - Returns current active key
- `rotateYouTubeApiKey()` - Switches to next key
- `searchInChannel()` - Searches specific channels with rotation
- `searchYouTubeGeneral()` - General search with rotation
- `fetchVideoDetails()` - Gets video info with rotation
- `findBestYouTubeVideo()` - Main entry point for video search

## Summary

✅ **Supports ANY concept** - Not limited to specific topics
✅ **Automatic key rotation** - Seamless fallback when quota exceeded
✅ **Multi-tier search** - Animation channels first, general search fallback
✅ **AI-powered** - Smart keyword extraction and video selection
✅ **Smart timestamps** - Skips intros/outros, shows only relevant content
✅ **Production-ready** - Handles errors gracefully, logs all operations

The system is now fully functional and will find animated educational videos for ANY topic you teach!
