import { HederaNetworkType, HtsTokenDetails } from "../../../types";

export const get_hts_token_details = async (
    tokenId: string,
    networkType: HederaNetworkType
): Promise<HtsTokenDetails> => {
    const url = `https://${networkType}.mirrornode.hedera.com/api/v1/tokens/${tokenId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}. message: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch HTS token details", error);
        throw error;
    }
};