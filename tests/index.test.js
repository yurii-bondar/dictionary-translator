const { translate, dictionary } = require('../dist');

describe('dictionary-translator', () => {
  const vocabulary = {
    car: ['автомобіль', 'automobilis', 'samochód', 'auto', 'car'],
    cars: [
      ['автомобіль', 'автомобілі', 'автомобілів'],
      ['automobilis', 'automobiliai', 'automobilių'],
      ['samochód', 'samochody', 'samochodów'],
      ['auto', 'auta', 'aut'],
      ['car', 'cars', 'cars'],
    ],
  };

  const LANG_IDS = {
    UKRAINIAN: 1,
    LITHUANIAN: 2,
    POLISH: 3,
    CZECH: 4,
    ENGLISH: 5,
  };

  const TRANSLATOR_IDS = {
    [LANG_IDS.UKRAINIAN]: 0,
    [LANG_IDS.LITHUANIAN]: 1,
    [LANG_IDS.POLISH]: 2,
    [LANG_IDS.CZECH]: 3,
    [LANG_IDS.ENGLISH]: 4,
  };

  const TEST_COUNTS = {
    ONE: 1,
    THREE: 3,
    SEVENTEEN: 17,
    FIFTY_ONE: 51,
    NINETY_NINE: 99,
  };

  const TRANSLATOR_ID = TRANSLATOR_IDS[LANG_IDS.UKRAINIAN];
  const translator = dictionary(vocabulary, TRANSLATOR_ID);

  test('should correctly translate singular "car"', () => {
    expect(translator('car')).toBe('автомобіль');
  });

  test('should correctly translate "cars" with numbers', () => {
    expect(translator('cars', TEST_COUNTS.ONE)).toBe('автомобіль');
    expect(translator('cars', TEST_COUNTS.THREE)).toBe('автомобілі');
    expect(translator('cars', TEST_COUNTS.SEVENTEEN)).toBe('автомобілів');
    expect(translator('cars', TEST_COUNTS.FIFTY_ONE)).toBe('автомобіль');
    expect(translator('cars', TEST_COUNTS.NINETY_NINE, 'capitalize')).toBe('Автомобілів');
  });

  test('should correctly translate singular "car" using translate function', () => {
    expect(translate(vocabulary, 'car', TRANSLATOR_ID)).toBe('автомобіль');
  });

  test('should correctly translate "cars" with numbers using translate function', () => {
    expect(translate(vocabulary, 'cars', TRANSLATOR_ID, TEST_COUNTS.ONE)).toBe('автомобіль');
    expect(translate(vocabulary, 'cars', TRANSLATOR_ID, TEST_COUNTS.THREE)).toBe('автомобілі');
    expect(translate(vocabulary, 'cars', TRANSLATOR_ID, TEST_COUNTS.SEVENTEEN)).toBe('автомобілів');
    expect(translate(vocabulary, 'cars', TRANSLATOR_ID, TEST_COUNTS.FIFTY_ONE)).toBe('автомобіль');
    expect(translate(vocabulary, 'cars', TRANSLATOR_ID, TEST_COUNTS.NINETY_NINE, 'capitalize')).toBe('Автомобілів');
  });
});
