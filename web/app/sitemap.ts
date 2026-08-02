import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getAbsoluteUrl("/").toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
