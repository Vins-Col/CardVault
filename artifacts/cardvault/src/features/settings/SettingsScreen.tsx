import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import {
  getCatalogProviderType,
  setCatalogProviderType,
} from "@/src/providers/catalog-registry";
import type { CatalogProviderType } from "@/src/providers/catalog-registry";

export default function SettingsScreen() {
  const colors = useColors();
  const [providerType, setProviderType] = useState<CatalogProviderType>(
    getCatalogProviderType(),
  );

  const handleSelect = async (type: CatalogProviderType) => {
    await setCatalogProviderType(type);
    setProviderType(type);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Settings
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Compare catalog providers for Smart Search.
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Card Catalog Provider (Temporary Switch)
          </Text>
          <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
            Switch between TCGdex and Pokémon TCG API to compare search
            capabilities.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={() => handleSelect("tcgdex")}
              style={[
                styles.button,
                {
                  backgroundColor:
                    providerType === "tcgdex" ? colors.primary : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color:
                      providerType === "tcgdex"
                        ? colors.background
                        : colors.foreground,
                  },
                ]}
              >
                TCGdex
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleSelect("pokemon-tcg-api")}
              style={[
                styles.button,
                {
                  backgroundColor:
                    providerType === "pokemon-tcg-api"
                      ? colors.primary
                      : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color:
                      providerType === "pokemon-tcg-api"
                        ? colors.background
                        : colors.foreground,
                  },
                ]}
              >
                Pokémon TCG API
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  sectionDesc: { fontSize: 14, marginBottom: 16 },
  buttonRow: { flexDirection: "row", gap: 12 },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  buttonText: { fontWeight: "600", fontSize: 16 },
});
