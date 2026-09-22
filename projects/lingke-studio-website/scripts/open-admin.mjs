import { exec } from "node:child_process";
import { platform } from "node:os";

const url = "http://localhost:5173/admin";

const cmd =
  platform() === "win32"
    ? `start "" "${url}"`
    : platform() === "darwin"
      ? `open "${url}"`
      : `xdg-open "${url}"`;

console.log(`正在打开管理后台：${url}`);
console.log("（请先另开终端运行 npm run dev）");

exec(cmd, (err) => {
  if (err) console.error("无法自动打开浏览器，请手动访问上述地址。");
});
