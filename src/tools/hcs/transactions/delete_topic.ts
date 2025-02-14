import { Client, TopicDeleteTransaction, TopicId } from "@hashgraph/sdk";
import { DeleteTopicResult } from "../../../types";

export const delete_topic = async (
    topicId: TopicId,
    client: Client
): Promise<DeleteTopicResult> => {
    const tx = new TopicDeleteTransaction()
        .setTopicId(topicId)
        .freezeWith(client);

    const txResponse = await tx.execute(client);

    const receipt = await txResponse.getReceipt(client);
    const txStatus = receipt.status;

    if (!txStatus.toString().includes('SUCCESS'))
        throw new Error("Topic creation transaction failed");

    return {
        txHash: txResponse.transactionId.toString(),
        status: txStatus.toString(),
    };
}