import { HederaNetworkType } from "../types";
import { get_hts_token_details } from "../tools";
import BigNumber from "bignumber.js";

export const toDisplayUnit = async (
    tokenId: string,
    value: BigNumber | number,
    networkType: HederaNetworkType
): Promise<BigNumber> => {
    try {
        const decimalsString = await getHTSDecimals(tokenId, networkType);
        const decimals = new BigNumber(decimalsString);
        const divisor = new BigNumber(10).pow(decimals);

        const bigValue = BigNumber.isBigNumber(value) ? value : new BigNumber(value);

        return bigValue.dividedBy(divisor);
    } catch (error) {
        console.error("Failed to convert base unit to display unit:", error);
        return new BigNumber(0);
    }
};

export const toBaseUnit = async (
    tokenId: string,
    displayValue: BigNumber | number,
    networkType: HederaNetworkType
): Promise<BigNumber> => {
    try {
        const decimalsString = await getHTSDecimals(tokenId, networkType);
        const decimals = new BigNumber(decimalsString);
        const multiplier = new BigNumber(10).pow(decimals);

        const bigDisplayValue = BigNumber.isBigNumber(displayValue)
            ? displayValue
            : new BigNumber(displayValue);

        return bigDisplayValue.multipliedBy(multiplier);
    } catch (error) {
        console.error("Failed to convert display unit to base unit:", error);
        return new BigNumber(0);
    }
};

export const getHTSDecimals = async (
    tokenId: string,
    networkType: HederaNetworkType
): Promise<string> => {
    return (await get_hts_token_details(tokenId, networkType)).decimals;
};
