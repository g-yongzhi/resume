/**
 * 单页站首页：锚点路径、同页 hash 点击、滚动到 id、封装 Link。
 * （原先拆在 siteNav / homeHashNav / scrollToHashId / HomeHashLink 四处。）
 */
import { forwardRef, type MouseEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  type LinkProps,
  type Location,
  type NavigateFunction,
} from "react-router-dom";

/** 与各 section 的 id、App 内 ScrollToHash 一致 */
export const homeHash = {
  mainContent: "/#main-content",
  about: "/#about",
  services: "/#services",
  work: "/#work",
  philosophy: "/#philosophy",
  contact: "/#contact",
} as const;

export const homeNavLinks = [
  { label: "关于", to: homeHash.about },
  { label: "服务", to: homeHash.services },
  { label: "作品", to: homeHash.work },
  { label: "联系", to: homeHash.contact },
] as const;

/** 按 id 滚动到锚点；节点未挂载时在后续帧重试 */
export function scrollToHashId(id: string, maxFrames = 180): void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = reduce ? "auto" : "smooth";

  let frames = 0;
  const step = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior, block: "start" });
      return;
    }
    frames += 1;
    if (frames >= maxFrames) return;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function handleHomeHashLinkClick(
  e: MouseEvent<HTMLAnchorElement>,
  to: string,
  location: Location,
  navigate: NavigateFunction,
): void {
  if (!to.includes("#")) return;
  let path: string;
  let hash: string;
  try {
    const u = new URL(to, window.location.origin);
    path = u.pathname || "/";
    hash = u.hash;
  } catch {
    return;
  }
  if (!hash || path !== location.pathname) return;
  e.preventDefault();
  const sameHash = location.hash === hash;
  void navigate(to);
  if (sameHash) {
    const id = decodeURIComponent(hash.slice(1));
    scrollToHashId(id);
  }
}

export const HomeHashLink = forwardRef<HTMLAnchorElement, LinkProps>(function HomeHashLink(
  { onClick, to, ...rest },
  ref,
) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Link
      ref={ref}
      to={to}
      {...rest}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (typeof to === "string") handleHomeHashLinkClick(e, to, location, navigate);
      }}
    />
  );
});
