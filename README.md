# Helper for working with translations using dictionaries

>#### Content
>[About](#about)   
[Constants](#constants)<br>
[Vocabulary](#vocabulary)<br>
> [Using](#using)<br>

<a name="about"><h2>About</h2></a>
- Helps you work with translations using existing word dictionaries
- Has functionality for working with numerical cases of words
- Has the ability to modify words from the dictionary

<a name="constants"><h2>Constants</h2></a>
```js
// constants/translator.js

const LANG_IDS = {
    UKRAINIAN: 1,
    LITHUANIAN: 2,
    POLISH: 3,
    CZECH: 4,
    ENGLISH: 5
};

module.exports = {
    LANG_IDS,
    TRANSLATOR_IDS: {
        [LANG_IDS.UKRAINIAN]: 0,
        [LANG_IDS.LITHUANIAN]: 1,
        [LANG_IDS.POLISH]: 2,
        [LANG_IDS.CZECH]: 3,
        [LANG_IDS.ENGLISH]: 4,
    },
    TEST_COUNTS: {
        ONE: 1,
        THREE: 3,
        SEVENTEEN: 17,
        FIFTY_ONE: 51,
        NINETY_NINE: 99
    }
}
```

<a name="vocabulary"><h2>Vocabulary</h2></a>
```js
// vocabularies/vehicles.js

module.exports = {
    // UKRAINIAN, LITHUANIAN, POLISH, CZECH, ENGLISH
    car: ['автомобіль', 'automobilis', 'samochód', 'auto', 'car'],
    cars: [
        // UKRAINIAN
        ['автомобіль', 'автомобілі', 'автомобілів'],
        // LITHUANIAN
        ['automobilis', 'automobiliai', 'automobilių'],
        // POLISH
        ['samochód', 'samochody', 'samochodów'],
        // CZECH
        ['auto', 'auta', 'aut'],
        // ENGLISH
        ['car', 'cars', 'cars'],
    ],
}
```
<b><i>Pay attention</i></b> to the sequence of translations you set up in your vocabulary

<a name="using"><h2>Using</h2></a>
```js
const { translate, dictionary } = require('dictionary-translator');

const { TRANSLATOR_IDS, LANG_IDS, TEST_COUNTS } = require('./constants/translator');
const VEHICLES_VOCABULARY = require('./vocabularies/vehicles');

// essentially define the index of the language we need
const TRANSLATOR_ID = TRANSLATOR_IDS[LANG_IDS.UKRAINIAN];

// Using a method to work as if with a translator instance
const translator = dictionary(VEHICLES_VOCABULARY, TRANSLATOR_ID);

console.log(translator('car'));
console.log(`${TEST_COUNTS.ONE} ${translator('cars', TEST_COUNTS.ONE)}`);
console.log(`${TEST_COUNTS.FIFTY_ONE} ${translator('cars', TEST_COUNTS.FIFTY_ONE)}`);
console.log(`${TEST_COUNTS.THREE} ${translator('cars', TEST_COUNTS.THREE)}`);
console.log(`${TEST_COUNTS.SEVENTEEN} ${translator('cars', TEST_COUNTS.SEVENTEEN)}`);
// used 'capitalize' modifier
console.log(`${TEST_COUNTS.NINETY_NINE} ${translator('cars', TEST_COUNTS.NINETY_NINE, 'capitalize')}`);

// Using the direct method for translation (better to use when there are several words in the vocabulary)
console.log(translate(VEHICLES_VOCABULARY, 'car', TRANSLATOR_ID));
console.log(`${TEST_COUNTS.ONE} ${translate(vocabulary, 'cars', TRANSLATOR_ID, TEST_COUNTS.ONE)}`);
console.log(`${TEST_COUNTS.FIFTY_ONE} ${translate(vocabulary, 'cars', TRANSLATOR_ID, TEST_COUNTS.FIFTY_ONE)}`);
console.log(`${TEST_COUNTS.THREE} ${translate(vocabulary, 'cars', TRANSLATOR_ID, TEST_COUNTS.THREE)}`);
console.log(`${TEST_COUNTS.SEVENTEEN} ${translate(vocabulary, 'cars', TRANSLATOR_ID, TEST_COUNTS.SEVENTEEN)}`);
// used 'capitalize' modifier
console.log(`${TEST_COUNTS.NINETY_NINE} ${translate(vocabulary, 'cars', TRANSLATOR_ID, TEST_COUNTS.NINETY_NINE, 'capitalize')}`);
```

What we get in the end (as you can see, the result is the same for both methods <i>translate</i> and <i>dictionary</i>):
```bash
[/rest-service]
> node index.js
автомобіль
1 автомобіль
51 автомобіль
3 автомобілі
17 автомобілів
99 Автомобілів
```
