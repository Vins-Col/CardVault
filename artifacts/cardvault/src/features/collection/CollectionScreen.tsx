import EmptySectionScreen from "@/src/components/EmptySectionScreen";

export default function CollectionScreen() {
  return (
    <EmptySectionScreen
      title="Collection"
      subtitle="Keep the cards you own organized in one place."
      icon="layers"
      emptyTitle="Your collection is empty"
      emptyMessage="Cards you add will be organized here."
    />
  );
}
