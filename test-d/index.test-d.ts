import { expectType } from 'tsd';
import {
    translate, dictionary, type Vocabulary,
} from '..';

const vocabulary: Vocabulary = {
    car: { en: 'car', uk: 'автомобіль' },
    cars: { en: { one: 'car', other: 'cars' } },
};

expectType<string | undefined>(translate(vocabulary, 'car', 'en'));
expectType<string | undefined>(translate(vocabulary, 'cars', 'en', {
    count: 51,
    params: { name: 'Yurii' },
    modifier: 'capitalize',
    fallbackLocale: 'uk',
    silent: true,
}));

const t = dictionary(vocabulary, 'en', { fallbackLocale: 'uk' });
expectType<string | undefined>(t('car'));
expectType<string | undefined>(t('cars', { count: 3 }));
