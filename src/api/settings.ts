import { http } from "./http";
import type { ShopContactInfo } from "./types";

export const settingsApi = {
  shopContactInfo: () =>
    http.get<ShopContactInfo>("/system/settings/shop-contact-info", { auth: false }).then((e) => e.data),
};
