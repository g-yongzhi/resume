import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SITE_CONTACT, type SiteContact } from "../lib/siteContact";

type SiteSettingsContextValue = {
  contact: SiteContact;
  loading: boolean;
  refresh: () => Promise<void>;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [contact, setContact] = useState<SiteContact>(DEFAULT_SITE_CONTACT);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/site/contact", { headers: { Accept: "application/json" } });
      const data = (await res.json()) as { ok?: boolean; contact?: SiteContact };
      if (res.ok && data.ok && data.contact) {
        setContact(data.contact);
      }
    } catch {
      /* 使用默认值 */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ contact, loading, refresh }), [contact, loading, refresh]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteContact() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    return {
      email: DEFAULT_SITE_CONTACT.email,
      phone: DEFAULT_SITE_CONTACT.phone,
      loading: false,
      refresh: async () => {},
    };
  }
  return {
    email: ctx.contact.email,
    phone: ctx.contact.phone,
    loading: ctx.loading,
    refresh: ctx.refresh,
  };
}

/** 供管理后台保存后刷新全站缓存 */
export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("SiteSettingsProvider required");
  return ctx;
}
