import { type NextRequest, NextResponse } from "next/server"
import { generateEducationalContent } from "@/lib/google-ai-services"
import { resolveTopicAssets } from "@/lib/topic-assets"
import { findBestYouTubeVideo } from "@/lib/youtube-video"

export const maxDuration = 120

function generateDatasetSignLanguageSVG(topicStr: string) {
  // Extract words and letters. Allow spaces, exclude everything else.
  // J and Z are excluded as they require motion in ASL
  const cleanTopic = topicStr.toUpperCase().replace(/[^A-IK-Y ]/g, '').replace(/\s+/g, ' ').trim();
  const words = cleanTopic.split(' ').filter(Boolean).slice(0, 6); // Support multiple words
  
  if (words.length === 0 || !cleanTopic) return ''; 

  // amer_sign2.png contains 6 columns and 4 rows (24 letters total, excluding J and Z)
  // Grid layout: A-F (row 0), G-M (row 1), N-S (row 2), T-Y (row 3)
  const letterMap: Record<string, {col: number, row: number}> = {
    'A': {col: 0, row: 0}, 'B': {col: 1, row: 0}, 'C': {col: 2, row: 0}, 'D': {col: 3, row: 0}, 'E': {col: 4, row: 0}, 'F': {col: 5, row: 0},
    'G': {col: 0, row: 1}, 'H': {col: 1, row: 1}, 'I': {col: 2, row: 1}, 'K': {col: 3, row: 1}, 'L': {col: 4, row: 1}, 'M': {col: 5, row: 1},
    'N': {col: 0, row: 2}, 'O': {col: 1, row: 2}, 'P': {col: 2, row: 2}, 'Q': {col: 3, row: 2}, 'R': {col: 4, row: 2}, 'S': {col: 5, row: 2},
    'T': {col: 0, row: 3}, 'U': {col: 1, row: 3}, 'V': {col: 2, row: 3}, 'W': {col: 3, row: 3}, 'X': {col: 4, row: 3}, 'Y': {col: 5, row: 3},
  };

  let htmlContent = `
<div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
  <div style="background: white; border-radius: 1rem; padding: 2rem; width: 100%; max-width: 1200px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h3 style="font-size: 2rem; font-weight: bold; color: #1e293b; margin-bottom: 0.5rem; text-align: center; text-transform: uppercase;">
      ✋ American Sign Language Fingerspelling ✋
    </h3>
    <p style="font-size: 1.125rem; color: #475569; margin-bottom: 0.5rem; text-align: center; font-weight: 600;">
      "${topicStr.toUpperCase()}"
    </p>
    <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 2rem; text-align: center;">
      Real ASL hand signs from dataset: amer_sign2.png
    </p>
    
    <div style="display: flex; flex-direction: column; gap: 2.5rem; align-items: center; width: 100%;">
`;

  words.forEach((word, wordIndex) => {
    const letters = word.split('').slice(0, 20); // Max 20 letters per word
    
    htmlContent += `
      <div style="width: 100%;">
        <div style="text-align: center; margin-bottom: 1rem;">
          <span style="font-size: 1.25rem; font-weight: bold; color: #6366f1; background: #e0e7ff; padding: 0.5rem 1.5rem; border-radius: 0.5rem; display: inline-block;">
            ${wordIndex > 0 ? `Word ${wordIndex + 1}: ` : ''}${word}
          </span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; padding: 1rem; background: #f8fafc; border-radius: 0.75rem; border: 2px solid #e2e8f0;">
`;
    
    letters.forEach((letter, letterIndex) => {
      const loc = letterMap[letter];
      
      if (!loc) {
        // Letter not in map (J or Z) - skip it
        return;
      }
      
      // Calculate exact background position for sprite sheet
      // 6 columns (0-5), 4 rows (0-3)
      const posX = loc.col * 20; // 100 / 5 = 20% per column
      const posY = loc.row * 33.3333; // 100 / 3 = 33.33% per row
      
      htmlContent += `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem; background: white; border: 2px solid #cbd5e1; border-radius: 1rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: transform 0.2s; min-width: 110px;">
            <div style="
              width: 100px; 
              height: 110px; 
              background-image: url('/dataset/amer_sign2.png');
              background-size: 600% 400%;
              background-position: ${posX}% ${posY}%;
              background-repeat: no-repeat;
              border-radius: 0.5rem;
              border: 1px solid #e2e8f0;
              box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
            "></div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.25rem;">
              <span style="font-size: 1.5rem; font-weight: 900; color: #1e293b; font-family: 'Arial Black', sans-serif;">${letter}</span>
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Position ${letterIndex + 1}</span>
            </div>
          </div>`;
    });
    
    htmlContent += `
        </div>
      </div>`;
  });

  htmlContent += `
    </div>
    
    <div style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 0.75rem; border: 2px solid #fbbf24;">
      <p style="font-size: 0.875rem; color: #78350f; text-align: center; margin: 0; font-weight: 600;">
        ⚠️ Note: Letters J and Z are not shown as they require fluid hand movement in American Sign Language
      </p>
      <p style="font-size: 0.75rem; color: #92400e; text-align: center; margin-top: 0.5rem; margin-bottom: 0;">
        All other letters (A-I, K-Y) are displayed using real ASL hand signs
      </p>
    </div>
  </div>
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

    // Priority 1: Pre-generated assets
    // Priority 2: DuckDuckGo image search (real educational images)
    // Priority 3: AI-generated SVG diagrams
    if (!imageUrl) {
      try {
        console.log("[Generate Content] Fetching educational image from DuckDuckGo Image Search...");
        const searchQuery = `${topic} educational diagram labeled visual explanation`;
        const q = encodeURIComponent(searchQuery);
        
        // 1. Fetch DuckDuckGo HTML to extract the VQD token
        const htmlRes = await fetch(`https://duckduckgo.com/?q=${q}&t=h_&iar=images&iax=images&ia=images`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        const htmlText = await htmlRes.text();
        const vqdMatch = htmlText.match(/vqd=([\d-]+)/);
        
        if (vqdMatch && vqdMatch[1]) {
          // 2. Fetch the actual JSON image payload using the token
          const vqd = vqdMatch[1];
          const imgRes = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${q}&vqd=${vqd}&f=,,,&p=1`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          const imgData = await imgRes.json();
          
          if (imgData.results && imgData.results.length > 0) {
            // Try to find the best educational image
            const educationalImage = imgData.results.find((img: any) => 
              img.image && (
                img.title?.toLowerCase().includes('diagram') ||
                img.title?.toLowerCase().includes('education') ||
                img.title?.toLowerCase().includes(topic.toLowerCase())
              )
            ) || imgData.results[0];
            
            imageUrl = educationalImage.image;
            usedSearchEngine = true;
            console.log("[Generate Content] ✅ Found educational image via DuckDuckGo:", imageUrl);
          } else {
            console.log("[Generate Content] No images found in DuckDuckGo results.");
          }
        } else {
          console.warn("[Generate Content] Could not extract DuckDuckGo VQD token.");
        }
      } catch (err) {
        console.error("[Generate Content] DuckDuckGo image search error:", err);
      }
      
      // Fallback to AI-generated SVG if DuckDuckGo search fails
      if (!imageUrl) {
         console.log("[Generate Content] Falling back to AI-generated SVG diagram");
         imageUrl = `/api/generate-image?prompt=${encodeURIComponent(generatedContent.imagePrompt)}&topic=${encodeURIComponent(topic)}`;
      }
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
