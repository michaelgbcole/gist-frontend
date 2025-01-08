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
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 4096,
            temperature: 0.5,
            top_p: 0.9,
            messages: [
                {
                    role: "user",
                    content: prompt.prompt
                }
            ]
        })
    };

    try {
        const command = new InvokeModelCommand(params);
        const response = await bedrock.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        // Handle different response formats
        if (responseBody.content?.[0]?.text) {
            return responseBody.content[0].text;
        } else if (responseBody.completion) {
            return responseBody.completion;
        } else if (responseBody.generations?.[0]?.text) {
            return responseBody.generations[0].text;
        } else {
            throw new Error('Unexpected response format from model');
        }
    } catch (error) {
        console.error('Error calling Bedrock:', error);
        throw new Error(`Failed to grade essay: ${(error as Error).message}`);
    }
}