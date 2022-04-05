import { parseSeed } from '@mappers/SeedUtils';

test('parses seed when seed is a number', () => {
  expect(parseSeed('10')).toEqual(10);
});

test('parses seed to default value when seed is a non-numeric string', () => {
  expect(parseSeed('fish')).toEqual(0);
});
