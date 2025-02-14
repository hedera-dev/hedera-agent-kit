import { Airdrop, HederaNetworkType, PendingAirdropsApiResponse } from "../../../types";

export const get_pending_airdrops = async (
    networkType: HederaNetworkType,
    accountId: string
): Promise<Airdrop[]> => {
    const url = `https://${networkType}.mirrornode.hedera.com/api/v1/accounts/${accountId}/airdrops/pending`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PendingAirdropsApiResponse = await response.json();
        return data.airdrops
    } catch (error) {
        console.error("Failed to fetch HTS balance:", error);
        throw error;
    }
};