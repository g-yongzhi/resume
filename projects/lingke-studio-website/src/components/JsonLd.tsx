/**
 * 在 <head> 注入 JSON-LD 结构化数据（配合 react-helmet-async）
 */
import { Helmet } from "react-helmet-async";

type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
