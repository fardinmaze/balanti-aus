import { http } from "./http";
import type { AboutUs } from "./types";

export const cmsApi = {
  aboutUs: () => http.get<AboutUs>("/cms/aboutus/view", { auth: false }).then((e) => e.data),
};
