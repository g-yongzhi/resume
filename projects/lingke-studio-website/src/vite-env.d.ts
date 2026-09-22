/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_API_BASE?: string;
  /** 百度搜索资源平台 → 站点验证 → HTML 标签中的 content */
  readonly VITE_BAIDU_SITE_VERIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}