import { AsyncStorageCollectionRepository } from "@/src/repositories/async-storage-collection-repository";
import { AsyncStorageWishlistRepository } from "@/src/repositories/async-storage-wishlist-repository";

export const collectionRepository = new AsyncStorageCollectionRepository();
export const wishlistRepository = new AsyncStorageWishlistRepository();
