import EmptySectionScreen from "@/src/components/EmptySectionScreen";

export default function SettingsScreen() {
  return (
    <EmptySectionScreen
      title="Settings"
      subtitle="Make CardVault work the way you collect."
      icon="settings"
      emptyTitle="Nothing to configure yet"
      emptyMessage="Settings will be added alongside the features they control."
    />
  );
}
