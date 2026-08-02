import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GuideFrame",
    short_name: "GuideFrame",
    description:
      "Browser layout grids, rulers, snapping guides, and DOM geometry inspection.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f9f7",
    theme_color: "#f9f9f7",
    categories: ["developer tools", "design"],
    icons: [
      {
        src: "/icon",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
