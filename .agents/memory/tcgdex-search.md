---
name: TCGdex number search
description: TCGdex can normalize leading-zero collector-number queries to unpadded IDs.
---

When searching TCGdex by collector number, a query such as `025` can return cards whose actual `localId` is `25`; the English endpoint did this during validation, while `eq:025` returned no matches.

**Why:** Treating the query as an exact match would hide results, while rewriting the displayed collector number would misrepresent the catalog record.

**How to apply:** Preserve and display each result's returned collector number. If the app later needs exact matching or leading-zero normalization, verify the behavior against the selected catalog language first.
