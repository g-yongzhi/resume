/** 全站对外联系方式默认值（数据库未加载时的兜底） */
export const SITE_EMAIL = "hello@lingke.studio";
export const SITE_PHONE = "+86 21 6888 0000";

export type SiteContact = {
  email: string;
  phone: string;
};

export const DEFAULT_SITE_CONTACT: SiteContact = {
  email: SITE_EMAIL,
  phone: SITE_PHONE,
};
