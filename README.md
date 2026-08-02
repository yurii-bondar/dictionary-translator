# dictionary-translator

[![CI](https://github.com/yurii-bondar/dictionary-translator/actions/workflows/ci.yml/badge.svg)](https://github.com/yurii-bondar/dictionary-translator/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/dictionary-translator.svg)](https://www.npmjs.com/package/dictionary-translator)
[![npm downloads](https://img.shields.io/npm/dm/dictionary-translator.svg)](https://www.npmjs.com/package/dictionary-translator)
[![license](https://img.shields.io/npm/l/dictionary-translator.svg)](./LICENSE)

A tiny, dependency-free i18n helper for translating words/phrases from plain-object
dictionaries — with **CLDR-correct pluralization** (via `Intl.PluralRules`) and
`{{param}}` interpolation. Ships with TypeScript types out of the box.

> #### Content
> [About](#about)<br>
> [Install](#install)<br>
> [Vocabulary](#vocabulary)<br>
> [Usage](#usage)<br>
> [API](#api)<br>

<a name="about"><h2>About</h2></a>

- Translates keys from a plain-object vocabulary you own — no build step, no external service.
- Picks the correct plural form **per locale** using `Intl.PluralRules` (CLDR rules), so
  English, Ukrainian, Polish, Czech, Lithuanian, etc. are each pluralized correctly —
  not with a single hard-coded formula.
- Supports `{{param}}` interpolation and dot-namespaced keys (`"user.greeting"`).
- Zero runtime dependencies. Full TypeScript declarations included.

<a name="install"><h2>Install</h2></a>

```bash
npm install dictionary-translator
```

<a name="vocabulary"><h2>Vocabulary</h2></a>

A vocabulary entry maps each locale (BCP 47 tag, e.g. `uk`, `en`, `pl`, `cs`, `lt`) to
either a plain string, or a map of CLDR plural categories (`one`, `few`, `many`, `other`, ...)
when the value depends on a count.

```js
// vocabularies/vehicles.js

module.exports = {
  car: {
    uk: 'автомобіль',
    en: 'car',
    pl: 'samochód',
    cs: 'auto',
    lt: 'automobilis',
  },
  cars: {
    uk: { one: 'автомобіль', few: 'автомобілі', many: 'автомобілів' },
    en: { one: 'car', other: 'cars' },
    pl: { one: 'samochód', few: 'samochody', many: 'samochodów', other: 'samochodów' },
    cs: { one: 'auto', few: 'auta', many: 'aut', other: 'aut' },
    lt: { one: 'automobilis', few: 'automobiliai', many: 'automobilių', other: 'automobilių' },
  },
  greeting: {
    uk: 'Привіт, {{name}}!',
    en: 'Hello, {{name}}!',
  },
};
```

<a name="usage"><h2>Usage</h2></a>

```js
const { translate, dictionary } = require('dictionary-translator');
const VEHICLES_VOCABULARY = require('./vocabularies/vehicles');

// Bound translator (recommended): fix the vocabulary + locale once.
const t = dictionary(VEHICLES_VOCABULARY, 'uk');

console.log(t('car'));                                    // автомобіль
console.log(`1 ${t('cars', { count: 1 })}`);               // 1 автомобіль
console.log(`3 ${t('cars', { count: 3 })}`);                // 3 автомобілі
console.log(`17 ${t('cars', { count: 17 })}`);              // 17 автомобілів
console.log(`51 ${t('cars', { count: 51 })}`);              // 51 автомобіль
console.log(`99 ${t('cars', { count: 99, modifier: 'capitalize' })}`); // 99 Автомобілів
console.log(t('greeting', { params: { name: 'Юрій' } }));   // Привіт, Юрій!

// Same, in English — note 51 correctly resolves to "cars", not "car":
const tEn = dictionary(VEHICLES_VOCABULARY, 'en');
console.log(`51 ${tEn('cars', { count: 51 })}`); // 51 cars

// Direct call (handy when translating a handful of one-off keys):
console.log(translate(VEHICLES_VOCABULARY, 'car', 'uk'));
console.log(translate(VEHICLES_VOCABULARY, 'cars', 'uk', { count: 3 }));
```

TypeScript:

```ts
import { translate, dictionary, type Vocabulary } from 'dictionary-translator';

const vocabulary: Vocabulary = require('./vocabularies/vehicles');
const t = dictionary(vocabulary, 'uk');
```

<a name="api"><h2>API</h2></a>

### `translate(vocabulary, key, locale, options?)`

| Option           | Type                             | Description                                                     |
|-------------------|----------------------------------|-------------------------------------------------------------------|
| `count`           | `number`                        | Selects the plural form via `Intl.PluralRules(locale)`.            |
| `params`          | `Record<string, string \| number>` | Values substituted into `{{param}}` placeholders.               |
| `modifier`        | `'capitalize'`                   | Post-processes the resolved string.                                |
| `fallbackLocale`  | `string`                        | Used if `locale` has no entry for the key.                         |
| `silent`          | `boolean`                       | Suppresses the `console.warn` on missing keys/locales.              |

Returns the translated `string`, or `undefined` if the key/locale can't be resolved
(a warning is logged via `console.warn` unless `silent: true`).

Keys may be dot-namespaced, e.g. `translate(vocabulary, 'user.greeting', 'en')`, as
long as the vocabulary nests them as plain objects (`{ user: { greeting: { en: '...' } } }`).

### `dictionary(vocabulary, locale, defaults?)`

Returns a bound `(key, options?) => string | undefined` function, so you don't have to
repeat `vocabulary`/`locale` on every call. `defaults` (`fallbackLocale`, `silent`) are
applied to every call and can still be overridden per-call via `options`.
