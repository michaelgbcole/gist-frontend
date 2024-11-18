import Replicate from "replicate";
const replicate = new Replicate();

async function checkPredictionStatus(prediction_id: string): Promise<any> {
    while (true) {
        const prediction_status = await replicate.predictions.get(prediction_id);
        if (prediction_status.status === "succeeded") {
            return prediction_status.output;
        } else if (prediction_status.status === "failed") {
            throw new Error("Prediction failed");
        }
        // Wait for a short period before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}



//!! TO WRITE STILL XDDDDDDDD
export default async function synthesize(overallFeedback: String): Promise<string[]> {
    const input = {
        top_p: 0.9,
        prompt: `Here is the array: ${overallFeedback}`,
        system_prompt: `<instructions>You are an experienced teacher, and your job is to take in an array of the feedback from many essays and return the six most important issues, rated on a scale of 50-100, with 100 being the greatest area of improvement.  YOUR RESPONSE SHOULD ONLY INCLUDE THIS FORMATTING, DO NOT WRITE ANY JUSTIFICATION, ONLY THE FOLLOWING FORMAT (if your response includes any other data, you will be fired): [{"metric": "Grammar", "value": 54}, {"metric": "Thesis", "value": 73 }]  <instructions> `,     
        min_tokens: 0,
        temperature: 0.6,
        presence_penalty: 1.15
    };

    const prediction = await replicate.predictions.create({
        model: "meta/meta-llama-3.1-405b-instruct",
        input
    });
    console.log('we running')
    return await checkPredictionStatus(prediction.id);
}