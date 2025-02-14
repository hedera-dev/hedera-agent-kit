import { TopicId } from "@hashgraph/sdk";
import { createBaseMirrorNodeApiUrl } from "../../../utils/api-utils";
import { HederaNetworkType, HCSMessage, HCSMessageApiResponse } from "../../../types";

/**
 * Method for fetching messages for given topic between timestamps. Messages are paginated, with 100 messages per page.
 * @param topicId id of requested topic
 * @param networkType network on which requested topic is hosted
 * @param lowerTimestamp optional unix timestamp in format seconds.milliseconds.
 * @param upperTimestamp optional unix timestamp in format seconds.milliseconds.
 */
export const get_topic_messages = async (
    topicId: TopicId,
    networkType: HederaNetworkType,
    lowerTimestamp?: number,
    upperTimestamp?: number,
): Promise<Array<HCSMessage>> => {
    const baseUrl = createBaseMirrorNodeApiUrl(networkType)
    const lowerThreshold = lowerTimestamp ? `&timestamp=gte:${lowerTimestamp}` : '';
    const upperThreshold = upperTimestamp ? `&timestamp=lte:${upperTimestamp}` : '';

    let url: string | null = `${baseUrl}/api/v1/topics/${topicId.toString()}/messages?encoding=UTF-8&limit=100&order=desc${lowerThreshold}${upperThreshold}`;

    const array = new Array<HCSMessage>();

    try {
        while (url) {   // Results are paginated
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}. Message: ${response.statusText}`);
            }

            const data: HCSMessageApiResponse = await response.json();

            array.push(...data.messages);

            // Update URL for pagination. This endpoint does not return full path to next page, it has to be built first
            url = data.links.next ? baseUrl + data.links.next : null;
        }
    } catch (error) {
        console.error("Failed to fetch token holders and their balances. Error:", error);
        throw error;
    }
    return array;
}
