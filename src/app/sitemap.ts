import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const publicRoutes = [
  "",
  "/gioi-thieu",
  "/chuong-trinh",
  "/lo-trinh",
  "/giang-vien",
  "/cau-hoi-thuong-gap",
  "/dang-ky-tu-van",
  "/dang-nhap",
  "/dieu-khoan",
  "/bao-mat",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
