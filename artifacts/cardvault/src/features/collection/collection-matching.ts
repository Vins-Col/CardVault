import type { CollectionItem } from "@/src/models/collection-item";

export function isSamePhysicalConfiguration(
  existing: CollectionItem,
  incoming: CollectionItem,
): boolean {
  return (
    existing.card.gameId === incoming.card.gameId &&
    existing.card.externalId === incoming.card.externalId &&
    existing.language === incoming.language &&
    existing.variant === incoming.variant &&
    existing.condition === incoming.condition
  );
}
