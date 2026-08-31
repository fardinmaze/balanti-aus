import { http } from "./http";
import type { SocialLinks } from "./types";

export const siteApi = {
  socialLinks: () => http.get<SocialLinks>("/site-api/social-links", { auth: false }).then((e) => e.data),
};
