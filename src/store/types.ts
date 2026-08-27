import type { CatalogueState } from "./modules/catalogue";
import type { CartState } from "./modules/cart";
import type { WishlistState } from "./modules/wishlist";
import type { AuthState } from "./modules/auth";
import type { CheckoutState } from "./modules/checkout";
import type { AccountState } from "./modules/account";
import type { AddressState } from "./modules/address";
import type { ReviewsState } from "./modules/reviews";
import type { ReturnsState } from "./modules/returns";

export type RootState = {
  catalogue: CatalogueState;
  cart: CartState;
  wishlist: WishlistState;
  auth: AuthState;
  checkout: CheckoutState;
  account: AccountState;
  address: AddressState;
  reviews: ReviewsState;
  returns: ReturnsState;
};
