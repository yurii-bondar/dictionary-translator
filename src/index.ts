/**
 * Interface for the vocabulary structure.
 */
interface Vocabulary {
    [key: string]: Translation | Translation[];
}

/**
 * Type for translations.
 * Either a string or an array of declensions for words.
 */
type Translation = string | string[] | [string, string, string];

/**
 * Determines the correct word declension based on the number provided.
 *
 * @param words - An array of declensions [singular, plural (2-4), plural (5+)].
 * @param number - The number to determine the declension.
 * @returns The correctly declined word.
 */
const declension = (words: string[], number: number): string => {
    const mod10 = number % 10;
    const mod100 = number % 100;

    if (mod100 >= 11 && mod100 <= 20) return words[2] || words[0];
    if (mod10 === 1) return words[0];
    if (mod10 >= 2 && mod10 <= 4) return words[1] || words[0];
    return words[2] || words[0];
};


/**
 * Modifies a string based on the provided modifier.
 *
 * @param string - The string to modify.
 * @param modifier - The type of modification ('capitalize', etc.).
 * @returns The modified string.
 */
const modification = (string: string, modifier: string): string => {
    switch (modifier) {
        case 'capitalize':
            return string && string[0].toUpperCase() + string.slice(1);
        default:
            return string;
    }
};

/**
 * Translates a key using the provided vocabulary.
 *
 * @param vocabulary - The vocabulary object.
 * @param key - The key to retrieve the translation for.
 * @param lang - The language index (e.g., 0 for Ukrainian, 1 for Russian, etc.).
 * @param count - Optional count for declension (e.g., for plural forms).
 * @param modifier - Optional string modifier (e.g., 'capitalize').
 * @returns The translated string, or undefined if the key doesn't exist.
 */
const translate = (
    vocabulary: Vocabulary,
    key: string,
    lang: number,
    count?: number,
    modifier?: string
): string | undefined => {
    const translation = vocabulary[key];

    if (!translation) {
        console.warn(`Translation for key "${key}" not found in the vocabulary.`);
        return undefined;
    }

    let result: string;

    if (Array.isArray(translation)) {
        const langTranslation = translation[lang];
        if (Array.isArray(langTranslation)) {
            result = declension(langTranslation, count || 0);
        } else {
            result = langTranslation as string;
        }
    } else {
        result = translation as string;
    }

    if (modifier) {
        result = modification(result, modifier);
    }

    return result;
};

/**
 * Creates a translator function with a predefined vocabulary and language.
 *
 * @param vocabulary - The vocabulary object.
 * @param lang - The language index (e.g., 0 for Ukrainian, 1 for Russian, etc.).
 * @returns A translator function.
 */
const dictionary = (vocabulary: Vocabulary, lang: number) => {
    return (key: string, count?: number, modifier?: string): string | undefined => {
        return translate(vocabulary, key, lang, count, modifier);
    };
};

export { translate, dictionary };
