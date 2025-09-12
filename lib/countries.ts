import { Country, CountryOption } from '../types/country';

export const COUNTRIES: Country[] = [
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    enabled: true,
  },
  // Future countries can be added here
  // {
  //   code: 'IN',
  //   name: 'India',
  //   flag: '🇮🇳',
  //   enabled: false,
  // },
  // {
  //   code: 'AE',
  //   name: 'United Arab Emirates',
  //   flag: '🇦🇪',
  //   enabled: false,
  // },
];

export const getEnabledCountries = (): Country[] => {
  return COUNTRIES.filter(country => country.enabled);
};

export const getCountryOptions = (): CountryOption[] => {
  return getEnabledCountries().map(country => ({
    label: `${country.flag} ${country.name}`,
    value: country.code,
  }));
};

export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(country => country.code === code);
};

export const getDefaultCountry = (): Country => {
  return getEnabledCountries()[0] || COUNTRIES[0];
};
