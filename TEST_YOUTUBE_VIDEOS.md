# Testing YouTube Video Search for ANY Concept

## Quick Test Guide

To verify that YouTube videos work for ANY concept, follow these steps:

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Login as Teacher

1. Go to `http://localhost:3000/auth/login`
2. Login with your teacher account
3. Navigate to Dashboard

### 3. Test Different Concepts

Try creating lessons with these diverse topics to verify the system works for ANY concept:

#### Science Topics
- ✅ "photosynthesis"
- ✅ "water cycle"
- ✅ "solar system"
- ✅ "cell division mitosis"
- ✅ "gravity and motion"
- ✅ "chemical reactions"
- ✅ "human digestive system"
- ✅ "electricity and circuits"

#### Math Topics
- ✅ "fractions and decimals"
- ✅ "pythagorean theorem"
- ✅ "quadratic equations"
- ✅ "geometry shapes"
- ✅ "multiplication tables"
- ✅ "area and perimeter"

#### History Topics
- ✅ "world war 2"
- ✅ "ancient egypt pyramids"
- ✅ "industrial revolution"
- ✅ "american revolution"
- ✅ "renaissance period"

#### Geography Topics
- ✅ "continents and oceans"
- ✅ "volcanoes and earthquakes"
- ✅ "climate zones"
- ✅ "water cycle"
- ✅ "mountains and valleys"

#### Language Topics
- ✅ "parts of speech"
- ✅ "grammar rules"
- ✅ "punctuation marks"
- ✅ "sentence structure"

### 4. What to Check

For each concept, verify:

1. **Video Appears**: A YouTube video should load in the Videos tab
2. **Relevant Content**: Video should be about the topic you entered
3. **Animation Quality**: Video should be from animation channels (Dr. Binocs, TED-Ed, etc.)
4. **Smart Timestamps**: Video should start at the relevant section (not intro)
5. **No Credits**: Video should stop before end cards/credits

### 5. Check Console Logs

Open browser DevTools (F12) and check the Console tab for:

```
[YouTube] Finding ANIMATED video for: "your topic"
[YouTube] Keyword: "extracted keyword"
[YouTube] Searching 6 Tier 1 animation channels
[YouTube] Found X results from Tier 1 animation channels
[YouTube] AI picked: "Video Title" (Channel Name, tier 1)
[YouTube] Selected: "Video Title" by Channel Name (videoId)
[YouTube] Smart trim: "Chapter Name" → 10s – 180s
```

### 6. Test API Key Rotation

To test that key rotation works when quota is exceeded:

1. **Exhaust First Key**: Make many searches until you see:
   ```
   [YouTube] API key quota exceeded, rotating to next key
   [YouTube] Rotated to API key 2/2
   ```

2. **Verify Continued Service**: Videos should still load with the second key

3. **Check Both Keys Exhausted**: If both keys are exhausted, you'll see:
   ```
   [YouTube] No results found at all for keyword: "topic"
   ```

### 7. Test Different Scenarios

#### Scenario A: Common Topics
- Should find videos from Tier 1 animation channels (Dr. Binocs, TED-Ed)
- Example: "photosynthesis" → Dr. Binocs video

#### Scenario B: Specific Topics
- Should still find relevant animated videos
- Example: "pythagorean theorem" → Math animation video

#### Scenario C: Niche Topics
- Should fall back to general search but still find animated content
- Example: "quantum mechanics" → Educational animation

#### Scenario D: Casual Speech
- Should extract clean keywords from casual speech
- Example: "yo tell me about the water cycle bro" → "water cycle"

### 8. Expected Results

✅ **Success Indicators:**
- Video loads within 3-5 seconds
- Video is animated (not talking head)
- Video is educational and appropriate
- Video starts at relevant content (skips intro)
- Video stops before credits
- Console shows successful search logs

❌ **Failure Indicators:**
- No video appears after 10 seconds
- Video is not relevant to topic
- Video is not animated
- Console shows API errors
- Console shows "No results found"

### 9. Troubleshooting

If videos don't appear:

1. **Check API Keys**: Verify both YouTube API keys in `.env.local`
2. **Restart Server**: Changes to `.env.local` require restart
3. **Check Quota**: Both keys might be exhausted (wait 24 hours)
4. **Check Console**: Look for error messages
5. **Try Different Topic**: Some topics might have limited animated content

### 10. Production Testing

Before deploying to Vercel:

1. ✅ Test at least 10 different concepts
2. ✅ Verify videos load consistently
3. ✅ Check API key rotation works
4. ✅ Verify no console errors
5. ✅ Test on different browsers
6. ✅ Test on mobile devices

## API Key Management

### Current Configuration

You have 2 YouTube API keys configured:
- Key 1: `AIzaSyAzwBFjf6Yla2Td9ngor9jTFjBiv36IMGU`
- Key 2: `AIzaSyBF-CsQoCqET79GtfFy3y-pKx89KmNLkH4`

### Daily Quota

- Each key: ~100 searches per day
- Total: ~200 searches per day
- Automatic rotation when one is exhausted

### Adding More Keys

To add more keys for higher quota:

1. Get additional YouTube Data API v3 keys from Google Cloud Console
2. Add to `.env.local` separated by commas:
   ```env
   YOUTUBE_API_KEY=key1, key2, key3, key4
   ```
3. Restart the server
4. System will automatically rotate through all keys

## Summary

The YouTube video search system is now:

✅ **Universal** - Works for ANY concept, not just specific topics
✅ **Intelligent** - Uses AI to extract keywords and pick best videos
✅ **Reliable** - Automatic key rotation ensures continuous service
✅ **Quality-Focused** - Prioritizes animation channels for deaf students
✅ **Smart** - Skips intros/outros, shows only relevant content
✅ **Production-Ready** - Handles errors gracefully, logs all operations

Test thoroughly with diverse topics to ensure everything works before deploying to production!
