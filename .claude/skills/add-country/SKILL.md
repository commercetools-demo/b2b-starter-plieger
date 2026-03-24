---
name: add-country
description: How to add support for a new locale (country + currency) to this storefront.
---

# Add a New Country / Currency

How to add support for a new locale (country + currency) to this storefront.

## Single source of truth

`site/lib/utils.ts` — `COUNTRY_CONFIG` is the **only** place you define a country. Everything else derives from it automatically.

```typescript
// site/lib/utils.ts
export const COUNTRY_CONFIG = {
  US: { currency: 'USD', locale: 'en-US', name: 'United States', flag: '🇺🇸' },
  GB: { currency: 'GBP', locale: 'en-GB', name: 'United Kingdom', flag: '🇬🇧' },
  DE: { currency: 'EUR', locale: 'de-DE', name: 'Germany', flag: '🇩🇪' },
  // Add your country here ↓
  FR: { currency: 'EUR', locale: 'fr-FR', name: 'France', flag: '🇫🇷' },
};
```

**What updates automatically** (no manual changes needed):
- `CURRENCY_LOCALE` map inside `formatMoney` — picks the right `Intl` locale per currency
- `useCountryConfig()` hook — client-side `CountrySelector` and `LocaleProvider` pick it up
- `getLocale()` server utility — recognises the new country cookie value

## Files that need manual changes

### 1. `site/messages/` — add translations

If the new locale uses a new language, add a message file:

```
site/messages/fr.json   ← copy from en.json, translate values
```

Then register the language in `site/i18n/request.ts` — the `availableLangs` check derives from `COUNTRY_CONFIG` so no change needed there, but the **file must exist** or the dynamic import will fall back to `en`.


### 2. `site/lib/utils.ts` — `useCombinedStreetField`

Controls whether checkout shows a single "Street Address" field (US style) or separate "Street Name" + "Street Number" fields (European style). Most European countries should return `false` (already the default). Only add an exception if needed:

```typescript
export function useCombinedStreetField(country: string): boolean {
  return country === 'US'; // add || country === 'CA' etc. if needed
}
```

### 3. `site/app/api/` — commercetools API

CT carts and orders are created per currency. If the new currency is not already in your CT project:
- Add pricing in the CT Merchant Center for products in the new currency
- Add a shipping method for the new country/zone in CT

No code changes needed — the API routes read currency/country from `getLocale()` which already flows from `COUNTRY_CONFIG`.

## Checklist

- [ ] Add entry to `COUNTRY_CONFIG` in `site/lib/utils.ts`
- [ ] Add `site/messages/<lang>.json` if it's a new language
- [ ] Add `<option>` to country selects in `site/app/checkout/page.tsx`
- [ ] Verify CT has prices and shipping methods for the new currency/country
- [ ] Smoke-test: select the new country via the `CountrySelector`, add a product to cart, check currency displays correctly, go through checkout
