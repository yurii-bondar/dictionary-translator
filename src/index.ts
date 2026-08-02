/**
 * CLDR plural categories, as returned by `Intl.PluralRules`.
 * Not every locale uses every category (e.g. English only uses "one"/"other").
 */
type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

type PluralForms = Partial<Record<PluralCategory, string>>;

type LocaleValue = string | PluralForms;

/** Per-key map of locale (BCP 47 tag, e.g. "uk", "en", "pl") -> translation. */
type LocaleMap = Record<string, LocaleValue>;

/**
 * Vocabulary structure. Keys can be nested (namespaced) objects,
 * or a flat locale map (the translation "leaf").
 * A node is treated as a leaf as soon as its values are strings or plural-form objects.
 */
interface Vocabulary {
    [key: string]: Vocabulary | LocaleMap;
}

type Modifier = 'capitalize';

interface TranslateOptions {
    /** Count used to pick the right plural form via `Intl.PluralRules`. */
    count?: number;
    /** Values to substitute into `{{placeholders}}` in the resolved string. */
    params?: Record<string, string | number>;
    /** Post-processing applied to the final string. */
    modifier?: Modifier;
    /** Locale to fall back to if the requested locale has no entry for the key. */
    fallbackLocale?: string;
    /** Suppress the `console.warn` emitted for missing keys/locales. */
    silent?: boolean;
}

const PLURAL_CATEGORIES = new Set<PluralCategory>(['zero', 'one', 'two', 'few', 'many', 'other']);

const isPluralForms = (value: unknown): value is PluralForms => (
    typeof value === 'object'
    && value !== null
    && Object.keys(value).every((key) => PLURAL_CATEGORIES.has(key as PluralCategory))
);

const isLocaleMap = (node: unknown): node is LocaleMap => (
    typeof node === 'object'
    && node !== null
    && Object.values(node).every((value) => typeof value === 'string' || isPluralForms(value))
);

/**
 * Resolves a (possibly dot-namespaced, e.g. "user.greeting") key to its locale map.
 */
const resolvePath = (vocabulary: Vocabulary, key: string): LocaleMap | undefined => {
    let node: unknown = vocabulary;

    for (const segment of key.split('.')) {
        if (typeof node !== 'object' || node === null) return undefined;
        node = (node as Record<string, unknown>)[segment];
    }

    return isLocaleMap(node) ? node : undefined;
};

const pluralRulesCache = new Map<string, Intl.PluralRules>();

const getPluralRules = (locale: string): Intl.PluralRules | undefined => {
    let rules = pluralRulesCache.get(locale);

    if (!rules) {
        try {
            rules = new Intl.PluralRules(locale);
            pluralRulesCache.set(locale, rules);
        } catch {
            return undefined;
        }
    }

    return rules;
};

/**
 * Picks the correct plural form for `count` in `locale`, using CLDR plural
 * rules (via `Intl.PluralRules`) instead of a single hard-coded formula.
 */
const pluralize = (forms: PluralForms, locale: string, count: number): string | undefined => {
    const category = getPluralRules(locale)?.select(count);
    return (category && forms[category]) ?? forms.other ?? Object.values(forms)[0];
};

const PARAM_PATTERN = /{{\s*(\w+)\s*}}/g;

/**
 * Substitutes `{{name}}` placeholders in `text` with values from `params`.
 * Unknown placeholders are left untouched.
 */
const interpolate = (text: string, params?: Record<string, string | number>): string => {
    if (!params) return text;

    return text.replace(PARAM_PATTERN, (match, name: string) => (
        Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
    ));
};

/**
 * Applies a post-processing modifier to a resolved translation.
 */
const modification = (text: string, modifier: Modifier): string => {
    switch (modifier) {
        case 'capitalize':
            return text && text[0].toUpperCase() + text.slice(1);
        default:
            return text;
    }
};

/**
 * Translates a key using the provided vocabulary.
 *
 * @param vocabulary - The vocabulary object.
 * @param key - The key to translate. May be dot-namespaced, e.g. "user.greeting".
 * @param locale - BCP 47 locale tag (e.g. "uk", "en", "pl", "cs", "lt").
 * @param options - Optional count/params/modifier/fallbackLocale/silent.
 * @returns The translated string, or `undefined` if the key/locale can't be resolved.
 */
const translate = (
    vocabulary: Vocabulary,
    key: string,
    locale: string,
    options: TranslateOptions = {},
): string | undefined => {
    const {
        count, params, modifier, fallbackLocale, silent,
    } = options;

    const localeMap = resolvePath(vocabulary, key);

    if (!localeMap) {
        if (!silent) console.warn(`Translation key "${key}" not found in the vocabulary.`);
        return undefined;
    }

    let entry = localeMap[locale];
    if (entry === undefined && fallbackLocale) {
        entry = localeMap[fallbackLocale];
    }

    if (entry === undefined) {
        if (!silent) console.warn(`No "${locale}" translation for key "${key}".`);
        return undefined;
    }

    let result = typeof entry === 'string' ? entry : pluralize(entry, locale, count ?? 0);

    if (result === undefined) return undefined;

    result = interpolate(result, params);

    if (modifier) {
        result = modification(result, modifier);
    }

    return result;
};

/**
 * Creates a translator function bound to a vocabulary, locale, and default options.
 *
 * @param vocabulary - The vocabulary object.
 * @param locale - BCP 47 locale tag (e.g. "uk", "en", "pl", "cs", "lt").
 * @param defaults - Default options (e.g. `fallbackLocale`, `silent`) applied to every call.
 * @returns A translator function `(key, options?) => string | undefined`.
 */
const dictionary = (
    vocabulary: Vocabulary,
    locale: string,
    defaults: Pick<TranslateOptions, 'fallbackLocale' | 'silent'> = {},
) => (key: string, options: TranslateOptions = {}): string | undefined => (
    translate(vocabulary, key, locale, { ...defaults, ...options })
);

export {
    translate,
    dictionary,
};
export type {
    Vocabulary, LocaleMap, PluralForms, PluralCategory, TranslateOptions, Modifier,
};
