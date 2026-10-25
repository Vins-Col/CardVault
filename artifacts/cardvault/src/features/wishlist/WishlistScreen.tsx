import EmptySectionScreen from "@/src/components/EmptySectionScreen";

export default function WishlistScreen() {
  return (
    <EmptySectionScreen
      title="Wishlist"
      subtitle="Keep track of cards you hope to collect."
      icon="heart"
      emptyTitle="Your wishlist is empty"
      emptyMessage="Cards you save for later will appear here."
      accent="blue"
    />
  );
}
