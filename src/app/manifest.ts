import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Diễn Giả Nhí",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fcf9f8",
    theme_color: "#785900",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
