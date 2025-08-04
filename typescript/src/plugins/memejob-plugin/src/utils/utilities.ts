import { MJ_TOKEN_DECIMALS } from './constants';

/**
 * Converts a token amount to its smallest unit representation (tiny units).
 */
export const toTiny = (value: number) => {
  return value * Math.pow(10, MJ_TOKEN_DECIMALS);
};
