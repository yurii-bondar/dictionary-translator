const { translate, dictionary } = require('../dist');

describe('dictionary-translator', () => {
  const vocabulary = {
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
      pl: {
        one: 'samochód', few: 'samochody', many: 'samochodów', other: 'samochodów',
      },
      cs: {
        one: 'auto', few: 'auta', many: 'aut', other: 'aut',
      },
      lt: {
        one: 'automobilis', few: 'automobiliai', many: 'automobilių', other: 'automobilių',
      },
    },
    greeting: {
      uk: 'Привіт, {{name}}!',
      en: 'Hello, {{name}}!',
    },
    user: {
      greeting: {
        uk: 'Вітаю, {{name}}',
        en: 'Welcome, {{name}}',
      },
    },
  };

  describe('singular translation', () => {
    test('translates a plain string per locale', () => {
      expect(translate(vocabulary, 'car', 'uk')).toBe('автомобіль');
      expect(translate(vocabulary, 'car', 'en')).toBe('car');
      expect(translate(vocabulary, 'car', 'pl')).toBe('samochód');
    });
  });

  describe('pluralization (Intl.PluralRules-based, correct per language)', () => {
    test('Ukrainian: 1/3/17/51/99', () => {
      expect(translate(vocabulary, 'cars', 'uk', { count: 1 })).toBe('автомобіль');
      expect(translate(vocabulary, 'cars', 'uk', { count: 3 })).toBe('автомобілі');
      expect(translate(vocabulary, 'cars', 'uk', { count: 17 })).toBe('автомобілів');
      expect(translate(vocabulary, 'cars', 'uk', { count: 51 })).toBe('автомобіль');
    });

    test('English: only "one" (1) vs "other" (everything else, including 51)', () => {
      expect(translate(vocabulary, 'cars', 'en', { count: 1 })).toBe('car');
      expect(translate(vocabulary, 'cars', 'en', { count: 51 })).toBe('cars');
      expect(translate(vocabulary, 'cars', 'en', { count: 0 })).toBe('cars');
    });

    test('capitalize modifier is applied after pluralization', () => {
      expect(translate(vocabulary, 'cars', 'uk', { count: 99, modifier: 'capitalize' }))
        .toBe('Автомобілів');
    });
  });

  describe('{{param}} interpolation', () => {
    test('substitutes known params and leaves unknown placeholders untouched', () => {
      expect(translate(vocabulary, 'greeting', 'uk', { params: { name: 'Юрій' } }))
        .toBe('Привіт, Юрій!');
      expect(translate(vocabulary, 'greeting', 'en', { params: {} }))
        .toBe('Hello, {{name}}!');
    });
  });

  describe('nested (dot-namespaced) keys', () => {
    test('resolves "user.greeting" via dot notation', () => {
      expect(translate(vocabulary, 'user.greeting', 'en', { params: { name: 'Yurii' } }))
        .toBe('Welcome, Yurii');
    });
  });

  describe('fallback locale', () => {
    test('falls back when the requested locale has no entry', () => {
      const partial = { hello: { en: 'Hello' } };
      expect(translate(partial, 'hello', 'de', { fallbackLocale: 'en' })).toBe('Hello');
    });
  });

  describe('missing keys / locales', () => {
    let warnSpy;

    beforeEach(() => {
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    test('returns undefined and warns for an unknown key', () => {
      expect(translate(vocabulary, 'unknown', 'uk')).toBeUndefined();
      expect(warnSpy).toHaveBeenCalled();
    });

    test('returns undefined and warns for a locale with no entry and no fallback', () => {
      expect(translate(vocabulary, 'car', 'de')).toBeUndefined();
      expect(warnSpy).toHaveBeenCalled();
    });

    test('silent: true suppresses the warning', () => {
      expect(translate(vocabulary, 'unknown', 'uk', { silent: true })).toBeUndefined();
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('dictionary() bound translator', () => {
    test('binds vocabulary/locale/defaults, matching translate()', () => {
      const t = dictionary(vocabulary, 'uk');
      expect(t('car')).toBe(translate(vocabulary, 'car', 'uk'));
      expect(t('cars', { count: 17 })).toBe(translate(vocabulary, 'cars', 'uk', { count: 17 }));
    });

    test('applies bound default options (e.g. fallbackLocale) to every call', () => {
      const partial = { hello: { en: 'Hello' } };
      const t = dictionary(partial, 'de', { fallbackLocale: 'en' });
      expect(t('hello')).toBe('Hello');
    });
  });
});
