import pdfParse from 'pdf-parse';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

async function getPdfText(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse(buffer);
    return data.text.trim();
  } catch (error) {
    console.error('Error reading PDF:', error);
    throw new Error(`Failed to read PDF: ${(error as Error).message}`);
  }
}

const bedrock = new BedrockRuntimeClient({ 
    region: "us-east-1",
    // Make sure your credentials are properly configured
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

export default async function gradeEssay(essayPublicUrl: string, rubric: string): Promise<string> {
    console.log('essayPublicUrlrealrealreal', essayPublicUrl)
    const essayText = await getPdfText(essayPublicUrl);
    console.log('essayText', essayText)

    console.log('grading')
    const prompt = {
        prompt: `[INST]You are a 25-year teacher grading papers. Grade this essay using the provided rubric.

Rubric:
${rubric}

Essay:
${essayText}

Return your response in this XML format:
<output>
<thinking>Detailed analysis of rubric requirements</thinking>
<criteriaFeedback>{"criteria_name": {"feedback": "feedback_text", "score": "score/total"}}</criteriaFeedback>
<finalScore>points/total</finalScore>
<overallFeedback>General essay feedback and summary</overallFeedback>
</output>[/INST]`,
    };

    const params = {
        modelId: "arn:aws:bedrock:us-east-1:954976296594:inference-profile/us.meta.llama3-3-70b-instruct-v1:0",  // Update with your config name
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            prompt: prompt.prompt,
            max_gen_len: 512,
            temperature: 0.5,
            top_p: 0.9
        })
    };

    try {
        const command = new InvokeModelCommand(params);
        const response = await bedrock.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        return responseBody.completion;
    } catch (error) {
        console.error('Error calling Bedrock:', error);
        throw error;
    }
}