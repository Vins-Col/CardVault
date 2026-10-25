import EmptySectionScreen from "@/src/components/EmptySectionScreen";

export default function SearchScreen() {
  return (
    <EmptySectionScreen
      title="Search"
      subtitle="Find cards across the games you collect."
      icon="search"
      emptyTitle="No catalog connected"
      emptyMessage="Card search becomes available when a catalog provider is added."
      accent="blue"
    />
  );
}
