import { execSync } from "child_process";

// Tool: Git diff dekhna (last commit mein kya change hua)
export function getGitDiff() {
  try {
    const diff = execSync("git diff HEAD~1 HEAD", { encoding: "utf-8" });
    return diff || "No changes found.";
  } catch (error) {
    return `Error getting git diff: ${error.message}`;
  }
}

// Tool: Git log dekhna (recent commits)
export function getGitLog() {
  try {
    const log = execSync("git log -5 --oneline", { encoding: "utf-8" });
    return log;
  } catch (error) {
    return `Error getting git log: ${error.message}`;
  }
}