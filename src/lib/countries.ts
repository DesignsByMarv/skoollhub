import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';

const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });

export const countries = getCountries()
  .map((code) => ({
    code,
    name: displayNames.of(code) ?? code,
    callingCode: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const defaultCountry = 'NG' as CountryCode;

export const courseOptions = [
  'Accounting',
  'Agricultural Economics',
  'Agricultural Engineering',
  'Agriculture',
  'Anatomy',
  'Architecture',
  'Banking and Finance',
  'Biochemistry',
  'Biology',
  'Building Technology',
  'Business Administration',
  'Chemical Engineering',
  'Chemistry',
  'Civil Engineering',
  'Computer Engineering',
  'Computer Science',
  'Dentistry',
  'Economics',
  'Education',
  'Electrical/Electronic Engineering',
  'English Language',
  'Estate Management',
  'Law',
  'Mass Communication',
  'Mathematics',
  'Mechanical Engineering',
  'Medicine and Surgery',
  'Microbiology',
  'Nursing Science',
  'Pharmacy',
  'Physics',
  'Political Science',
  'Psychology',
  'Public Administration',
  'Quantity Surveying',
  'Radiography',
  'Sociology',
  'Theatre Arts',
  'Veterinary Medicine',
];
