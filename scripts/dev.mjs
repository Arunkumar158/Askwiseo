import { existsSync } from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const backendDir = path.join(rootDir, "backend");
const isWindows = process.platform === "win32";

const apiHost = process.env.API_HOST || "127.0.0.1";
const apiPort = process.env.API_PORT || "8000";
const apiOrigin = process.env.API_PROXY_URL || `http://${apiHost}:${apiPort}`;
const backendOnly = process.argv.includes("--backend-only");

const defaultBackendPython = path.join(
  backendDir,
  "venv",
  isWindows ? "Scripts/python.exe" : "bin/python",
);
const fallbackBackendPython = path.join(
  rootDir,
  ".venv",
  isWindows ? "Scripts/python.exe" : "bin/python",
);
const python = process.env.BACKEND_PYTHON
  || (existsSync(defaultBackendPython) ? defaultBackendPython : fallbackBackendPython);
const nextBin = path.join(rootDir, "node_modules", ".bin", isWindows ? "next.cmd" : "next");

let shuttingDown = false;
const children = [];

function startProcess(name, command, args, options) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });

  children.push({ name, child });

  child.on("error", (error) => {
    console.error(`[${name}] failed to start: ${error.message}`);
    shutdown(1);
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.error(`[${name}] exited with ${reason}`);
    shutdown(code ?? 1);
  });
}

function stopChild(child) {
  if (!child.pid || child.exitCode !== null) return;

  if (isWindows) {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
    });
    return;
  }

  child.kill("SIGTERM");
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const { child } of children) {
    stopChild(child);
  }

  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log(`[dev] Starting FastAPI backend on ${apiOrigin}`);
startProcess("backend", python, [
  "-m",
  "uvicorn",
  "main:app",
  "--host",
  apiHost,
  "--port",
  apiPort,
], {
  cwd: backendDir,
  env: process.env,
});

if (!backendOnly) {
  console.log("[dev] Starting Next.js frontend on http://localhost:3000");
  startProcess("web", nextBin, ["dev"], {
    cwd: rootDir,
    env: {
      ...process.env,
      API_PROXY_URL: apiOrigin,
    },
  });
}
