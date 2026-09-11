import "dotenv/config";
import { askGroq } from "./llm/groqClient.js";

const reply = await askGroq("Explain what an Api is, in one line")
console.log("AI Says", reply)