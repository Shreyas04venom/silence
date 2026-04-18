const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const keys = (process.env.GEMINI_API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);
  const genAI = new GoogleGenerativeAI(keys[0]);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const imgBuffer = fs.readFileSync('Dataset/american_sign_language.PNG');
  const base64Data = imgBuffer.toString('base64');

  const prompt = `This is a colorful American Sign Language alphabet chart. 
Please reply with a valid JSON object mapping each uppercase letter (A-Z, excluding J and Z if they are missing) to its relative bounding box in percentages or exact pixel coordinates (assuming width and height). 
Example output:
{
  "A": { "x": 0, "y": 0, "width": 100, "height": 100 },
  "B": { "x": 100, "y": 0, "width": 100, "height": 100 }
}
Be as precise as possible, look at the grid structure. Return ONLY JSON.`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/png"
        }
      }
    ]);
    console.log(result.response.text());
  } catch (error) {
    console.error(error);
  }
}
run();
