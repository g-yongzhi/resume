/**
 * Schema.org JSON-LD：组织身份、网站、服务与案例页结构化数据（百度 / Google 通用）
 */
import { DEFAULT_SITE_CONTACT, type SiteContact } from "./siteContact";

export const SITE_BRAND = "灵壳 LINGKE";
export const SITE_ALTERNATE_NAME = "LINGKE";

import { HOME_DESCRIPTION } from "./siteSeo";
import { absoluteSiteUrl, getSiteBaseUrl } from "./siteUrl";

export { DEFAULT_SITE, getSiteBaseUrl } from "./siteUrl";

const SERVICE_TYPES = ["网站定制", "小程序开发", "H5 开发", "App 开发", "品牌识别", "数字产品设计"];

export function absoluteSchemaUrl(path: string, base = getSiteBaseUrl()) {
  return absoluteSiteUrl(path, base);
}

export function organizationId(site = getSiteBaseUrl()) {
  return `${site}/#organization`;
}

export function websiteId(site = getSiteBaseUrl()) {
  return `${site}/#website`;
}

function organizationNode(site: string, contact: SiteContact) {
  const logo = absoluteSchemaUrl("/apple-touch-icon.png", site);
  return {
    "@type": "Organization",
    "@id": organizationId(site),
    name: SITE_BRAND,
    alternateName: SITE_ALTERNATE_NAME,
    url: `${site}/`,
    logo: {
      "@type": "ImageObject",
      url: logo,
      width: 180,
      height: 180,
    },
    image: logo,
    description: HOME_DESCRIPTION,
    email: contact.email,
    telephone: contact.phone,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: contact.email,
        telephone: contact.phone,
        availableLanguage: ["zh-CN", "en"],
      },
    ],
  };
}

/** 首页：组织 + 网站 + 专业服务 + 首页 WebPage */
export function buildHomePageSchemaGraph(contact: SiteContact = DEFAULT_SITE_CONTACT, site = getSiteBaseUrl()) {
  const orgId = organizationId(site);
  const webId = websiteId(site);
  const logo = absoluteSchemaUrl("/apple-touch-icon.png", site);

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(site, contact),
      {
        "@type": "WebSite",
        "@id": webId,
        url: `${site}/`,
        name: SITE_BRAND,
        alternateName: SITE_ALTERNATE_NAME,
        description: HOME_DESCRIPTION,
        inLanguage: "zh-CN",
        publisher: { "@id": orgId },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${site}/#professional-service`,
        name: SITE_BRAND,
        url: `${site}/`,
        image: logo,
        description: HOME_DESCRIPTION,
        areaServed: { "@type": "Country", name: "中国" },
        serviceType: SERVICE_TYPES,
        provider: { "@id": orgId },
      },
      {
        "@type": "WebPage",
        "@id": `${site}/#webpage`,
        url: `${site}/`,
        name: `${SITE_BRAND} — 高端数字创意与产品工作室`,
        description: HOME_DESCRIPTION,
        inLanguage: "zh-CN",
        isPartOf: { "@id": webId },
        about: { "@id": orgId },
      },
    ],
  };
}

export type CaseStudySchemaInput = {
  /** 页面 / 作品主标题（建议与 document title 一致） */
  name: string;
  description: string;
  url: string;
  image: string;
  /** 面包屑末级短名（默认与 name 相同） */
  breadcrumbName?: string;
  /** 面包屑中间层，如「网站定制案例」 */
  categoryLabel: string;
  datePublished?: string;
};

/** 案例子页：WebPage + CreativeWork + BreadcrumbList */
export function buildCaseStudySchemaGraph(input: CaseStudySchemaInput, site = getSiteBaseUrl()) {
  const orgId = organizationId(site);
  const webId = websiteId(site);
  const workId = `${input.url}#creativework`;
  const pageId = `${input.url}#webpage`;

  const creativeWork: Record<string, unknown> = {
    "@type": "CreativeWork",
    "@id": workId,
    name: input.name,
    description: input.description,
    url: input.url,
    image: input.image,
    inLanguage: "zh-CN",
    creator: { "@id": orgId },
    publisher: { "@id": orgId },
  };
  if (input.datePublished) {
    creativeWork.datePublished = input.datePublished;
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageId,
        url: input.url,
        name: input.name,
        description: input.description,
        inLanguage: "zh-CN",
        isPartOf: { "@id": webId },
        about: { "@id": workId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: input.image,
        },
      },
      creativeWork,
      {
        "@type": "BreadcrumbList",
        "@id": `${input.url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "首页",
            item: `${site}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "精选作品",
            item: `${site}/#work`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: input.categoryLabel,
            item: `${site}/#work`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: input.breadcrumbName ?? input.name,
            item: input.url,
          },
        ],
      },
    ],
  };
}
