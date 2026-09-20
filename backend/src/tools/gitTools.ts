import { execSync } from "child_process";

// Helper: lamba text ko chhota kar do
function truncate(text, maxChars = 1500) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n...(truncated, output was too long)";
}

export function getGitLog(commitCount = 5) {
  try {
    const log = execSync(`git log -${commitCount} --oneline`, { encoding: "utf-8" });
    return truncate(log);
  } catch (error) {
    return `Error getting git log: ${error.message}`;
  }
}

export function getGitDiff(commitsBack = 1) {
  try {
    const diff = execSync(`git diff HEAD~${commitsBack} HEAD`, { encoding: "utf-8" });
    return truncate(diff || "No changes found.");
  } catch (error) {
    return `Error getting git diff: ${error.message}`;
  }
}