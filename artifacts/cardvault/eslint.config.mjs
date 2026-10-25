import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".expo/**", "dist/**", "node_modules/**"],
  },
  ...tseslint.configs.recommended,
);
