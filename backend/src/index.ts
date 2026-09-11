import "dotenv/config";
import { askGroq } from "./llm/groqClient.js";

// 1. Zero-shot (already tested)
const zeroShot = await askGroq("Classify the sentiment: 'This product is amazing!'");
console.log("🔹 Zero-shot:", zeroShot);

// 2. Few-shot — examples dekar pattern sikhaya
const fewShotPrompt = `
Text: "This product is amazing!" -> Positive
Text: "Worst purchase ever." -> Negative
Text: "It's okay, does the job." -> Neutral
Text: "Delivery was super fast and packaging was great" -> 
`;
const fewShot = await askGroq(fewShotPrompt);
console.log("🔹 Few-shot:", fewShot);

// 3. Chain-of-thought — step-by-step sochne ko kaha
const cotPrompt = `
Solve step by step: A train travels at 60 km/h for 2.5 hours. 
How much distance does it cover? Show your reasoning, then give the final answer.
`;
const cot = await askGroq(cotPrompt);
console.log("🔹 Chain-of-thought:", cot);