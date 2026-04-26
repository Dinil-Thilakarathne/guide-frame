import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getAbsoluteUrl("/").toString(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
