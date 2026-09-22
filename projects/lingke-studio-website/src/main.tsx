/**
 * 应用入口：把 React 挂载到 index.html 里的 #root
 * HelmetProvider：供 App 内 SiteHead 写页面 title/meta（SEO）
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App";

/** 避免刷新 / 返回后沿用错误滚动位置；无锚点 URL 在首屏脚本阶段先置顶，再交给 React 处理 hash */
if (typeof window !== "undefined") {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
  const h = window.location.hash;
  if (!h || h.length < 2) {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
