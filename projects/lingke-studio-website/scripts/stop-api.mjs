/**
 * 释放 API 端口（默认 3001），解决 EADDRINUSE。
 * 用法：npm run stop:api
 */
import { execSync } from "node:child_process";

const port = String(process.env.PORT ?? 3001);

function killOnWindows() {
  const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    if (!line.includes("LISTENING")) continue;
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && /^\d+$/.test(pid)) pids.add(pid);
  }
  if (!pids.size) {
    console.log(`[stop:api] 端口 ${port} 未被占用`);
    return;
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`[stop:api] 已结束进程 PID ${pid}`);
    } catch {
      console.warn(`[stop:api] 无法结束 PID ${pid}，可尝试以管理员身份运行`);
    }
  }
}

function killOnUnix() {
  try {
    const pid = execSync(`lsof -ti :${port}`, { encoding: "utf8" }).trim();
    if (!pid) {
      console.log(`[stop:api] 端口 ${port} 未被占用`);
      return;
    }
    execSync(`kill -9 ${pid.split("\n").join(" ")}`);
    console.log(`[stop:api] 已结束占用端口 ${port} 的进程`);
  } catch {
    console.log(`[stop:api] 端口 ${port} 未被占用`);
  }
}

if (process.platform === "win32") killOnWindows();
else killOnUnix();
