import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudioServer } from "./studio-api.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

const studioPort = Number(process.env.STUDIO_PORT || 3099);
const nextPort = Number(process.env.PORT || 3000);

const studioServer = createStudioServer();

studioServer.listen(studioPort, "127.0.0.1", () => {
  console.log(`[katalogweb] local studio api ready at http://127.0.0.1:${studioPort}`);
});

const isWindows = process.platform === "win32";
const nextProc = isWindows
  ? spawn("cmd.exe", ["/c", "npx.cmd", "next", "dev", "--port", String(nextPort)], {
      cwd: ROOT_DIR,
      stdio: "inherit",
      env: process.env,
    })
  : spawn("npx", ["next", "dev", "--port", String(nextPort)], {
      cwd: ROOT_DIR,
      stdio: "inherit",
      env: process.env,
    });

function shutdown(signal) {
  studioServer.close();
  if (!nextProc.killed) {
    nextProc.kill(signal);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

nextProc.on("exit", (code) => {
  studioServer.close();
  process.exit(code ?? 0);
});
