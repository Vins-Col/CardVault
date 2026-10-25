/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: "#F4F5F7",
    tint: "#FF7A1A",

    // Core surfaces
    background: "#101216",
    foreground: "#F4F5F7",

    // Cards / elevated surfaces
    card: "#1A1D23",
    cardForeground: "#F4F5F7",

    // Primary action color (buttons, links, active states)
    primary: "#FF7A1A",
    primaryForeground: "#101216",

    // Secondary / less-emphasis interactive surfaces
    secondary: "#202833",
    secondaryForeground: "#E7EDF5",

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: "#1A1D23",
    mutedForeground: "#9AA3B2",

    // Accent highlights (badges, selected items, focus rings)
    accent: "#3D9CFF",
    accentForeground: "#08111D",

    // Destructive actions (delete, error states)
    destructive: "#FF5C60",
    destructiveForeground: "#101216",

    // Borders and input outlines
    border: "#2B303A",
    input: "#2B303A",
  },

  dark: {
    text: "#F4F5F7",
    tint: "#FF7A1A",
    background: "#101216",
    foreground: "#F4F5F7",
    card: "#1A1D23",
    cardForeground: "#F4F5F7",
    primary: "#FF7A1A",
    primaryForeground: "#101216",
    secondary: "#202833",
    secondaryForeground: "#E7EDF5",
    muted: "#1A1D23",
    mutedForeground: "#9AA3B2",
    accent: "#3D9CFF",
    accentForeground: "#08111D",
    destructive: "#FF5C60",
    destructiveForeground: "#101216",
    border: "#2B303A",
    input: "#2B303A",
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 18,
};

export default colors;
