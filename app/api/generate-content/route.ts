import { type NextRequest, NextResponse } from "next/server"
import { generateEducationalContent } from "@/lib/google-ai-services"
import { resolveTopicAssets } from "@/lib/topic-assets"
import { findBestYouTubeVideo } from "@/lib/youtube-video"

export const maxDuration = 120

function generateDatasetSignLanguageSVG(topicStr: string) {
  // Extract words and letters. Allow spaces, exclude everything else.
  const cleanTopic = topicStr.toUpperCase().replace(/[^A-IK-Y ]/g, '').replace(/\s+/g, ' ').trim();
  const words = cleanTopic.split(' ').slice(0, 6); // Support multiple words
  
  if (words.length === 0 || !cleanTopic) return ''; 

  // amer_sign2.png contains 6 columns and 4 rows.
  // We use CSS percentage positioning to flawlessly slice the uniform grid.
  const letterMap: Record<string, {col: number, row: number}> = {
    'A': {col: 0, row: 0}, 'B': {col: 1, row: 0}, 'C': {col: 2, row: 0}, 'D': {col: 3, row: 0}, 'E': {col: 4, row: 0}, 'F': {col: 5, row: 0},
    'G': {col: 0, row: 1}, 'H': {col: 1, row: 1}, 'I': {col: 2, row: 1}, 'K': {col: 3, row: 1}, 'L': {col: 4, row: 1}, 'M': {col: 5, row: 1},
    'N': {col: 0, row: 2}, 'O': {col: 1, row: 2}, 'P': {col: 2, row: 2}, 'Q': {col: 3, row: 2}, 'R': {col: 4, row: 2}, 'S': {col: 5, row: 2},
    'T': {col: 0, row: 3}, 'U': {col: 1, row: 3}, 'V': {col: 2, row: 3}, 'W': {col: 3, row: 3}, 'X': {col: 4, row: 3}, 'Y': {col: 5, row: 3},
  };

  let htmlContent = `
<div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem 0;">
  <h3 style="font-size: 1.5rem; font-weight: bold; color: #0f172a; margin-bottom: 0.25rem; text-align: center;">Fingerspelling: "${topicStr.toUpperCase()}"</h3>
  <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 2.5rem; text-align: center;">Visually isolated dynamically using dataset: amer_sign2.png</p>
  <div style="display: flex; flex-wrap: wrap; gap: 3rem; justify-content: center; max-width: 100%;">
`;

  words.forEach((word) => {
    // Add a flex container for each individual word
    htmlContent += `\n<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center;">`;
    const letters = word.split('').slice(0, 16); 
    letters.forEach((letter) => {
      const loc = letterMap[letter] || letterMap['A'];
      
      // Perfect percentage bounding box logic (6 columns, 4 rows)
      // Percentage = col index / (total columns - 1) * 100
      const posX = loc.col * 20; // 100 / 5 = 20
      const posY = loc.row * 33.3333; // 100 / 3 = 33.3333
      
      htmlContent += `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.4rem; background: rgba(255, 255, 255, 0.9); border: 1px solid #cbd5e1; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="
          width: 94px; 
          height: 100px; 
          background-image: url('/dataset/amer_sign2.png');
          background-size: 600% 400%;
          background-position: ${posX}% ${posY}%;
          background-repeat: no-repeat;
          border-radius: 0.5rem;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        "></div>
        <span style="font-size: 1.25rem; font-weight: 800; color: #1e293b;">${letter}</span>
      </div>`;
    });
    htmlContent += `</div>`;
  });

  htmlContent += `
  </div>
  <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 2.5rem; text-align: center;">* Note: J and Z are excluded in this dataset as they require fluid hand movement.</p>
</div>
`;
  return htmlContent;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const topic = (body.topic || "").toString().trim()
    const chapter = (body.chapter || "").toString().trim()
    const standard = (body.standard || "").toString().trim()
    const subject = (body.subject || "").toString().trim()

    if (!topic || topic.length < 2) {
      return NextResponse.json({ error: "Topic is required and must be at least 2 characters." }, { status: 400 })
    }

    if (topic.length > 200) {
      return NextResponse.json({ error: "Topic is too long. Please keep it under 200 characters." }, { status: 400 })
    }

    console.log("[Generate Content] Starting - Topic:", topic)

    // Run AI content generation and YouTube search in parallel for speed
    const [content, youtubeVideo] = await Promise.allSettled([
      generateEducationalContent(topic, chapter, standard, subject),
      findBestYouTubeVideo(topic, subject, chapter, standard),
    ])

    const generatedContent =
      content.status === "fulfilled"
        ? content.value
        : {
            explanation: `${topic} is an important concept in ${subject || "this subject"}.`,
            imagePrompt: `Educational diagram of ${topic}`,
            detailedIllustrationSVG: "",
            signLanguageSVG: "",
            visualTranscript: "",
          }

    const ytVideo = youtubeVideo.status === "fulfilled" ? youtubeVideo.value : null
    if (youtubeVideo.status === "rejected") {
      console.warn("[Generate Content] YouTube search failed:", youtubeVideo.reason)
    }

    console.log("[Generate Content] Success - Generated AI content")

    const matchedAssets = resolveTopicAssets({ topic, chapter, subject, standard })
    let imageUrl = matchedAssets.imageUrl;
    let usedSearchEngine = false;

    // ALWAYS use AI-generated SVG diagrams (same as localhost behavior)
    // This ensures consistent high-quality educational diagrams in both localhost and Vercel
    if (!imageUrl) {
      console.log("[Generate Content] Using AI image generator for educational diagram");
      imageUrl = `/api/generate-image?prompt=${encodeURIComponent(generatedContent.imagePrompt)}&topic=${encodeURIComponent(topic)}`;
    }

    console.log("[Generate Content] Image URL:", imageUrl, matchedAssets.imageUrl ? "(pre-generated)" : "(dynamic)")

    // Build animation URL:
    // Priority 1: YouTube animated video (native player)
    // Priority 2: Pre-built local HTML animation asset
    // Priority 3: null (fallback handled in teacher dashboard)
    let animationUrl: string | null = null
    let youtubeVideoData: object | null = null

    if (ytVideo) {
      // Pass YouTube video data as a special JSON payload
      // Prefix "yt:" signals the player component to render the native YouTube player
      youtubeVideoData = {
        videoId: ytVideo.videoId,
        title: ytVideo.title,
        channelTitle: ytVideo.channelTitle,
        startSeconds: ytVideo.startSeconds,
        endSeconds: ytVideo.endSeconds,
        thumbnailUrl: ytVideo.thumbnailUrl,
      }
      console.log(`[Generate Content] YouTube video found: "${ytVideo.title}" (${ytVideo.videoId})`)
    } else if (matchedAssets.animationUrl) {
      animationUrl = matchedAssets.animationUrl
      console.log("[Generate Content] Using pre-built animation asset")
    }

    return NextResponse.json({
      explanation: generatedContent.explanation,
      imageUrl,
      // When we have a curated image asset or search engine result, prefer it over the AI SVG.
      detailedIllustrationSVG: (matchedAssets.imageUrl || usedSearchEngine) ? null : generatedContent.detailedIllustrationSVG,
      animationUrl,
      youtubeVideo: youtubeVideoData,
      animationCode: null,
      signLanguageSVG: generateDatasetSignLanguageSVG(topic),
      visualTranscript: generatedContent.visualTranscript,
      imagePrompt: generatedContent.imagePrompt,
    })
  } catch (error) {
    console.error("[Generate Content] Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate content"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    )
  }
}
