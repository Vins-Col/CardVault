import EmptySectionScreen from "@/src/components/EmptySectionScreen";

export default function HomeScreen() {
  return (
    <EmptySectionScreen
      title="Your cards, together."
      subtitle="A dedicated home for the cards you collect and care about."
      icon="grid"
      emptyTitle="Your vault is ready"
      emptyMessage="Your collection overview will appear here when cards are added."
    />
  );
}
