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
        prompt: `You are a 25-year teacher grading papers. Grade this essay using the provided rubric.

Rubric:
${rubric}

Essay:
${essayText}
[INST]<personality>You are a 25-year teacher who is renowned for your detail orrientated nature when grading others' papers. When working, you have an abundance of time and always consider both the student and teacher perspective.</personality><instructions>Your whole output should be in valid XML, which means characters like apostrophes, quotes, and ampersands must be properly escaped. Read these instructions very carefully, and do not miss any steps. If you do miss any steps, you will be fired, and your family will starve to death, or will be forced to cannibalize eachother. Make sure to enclose the whole output in <output> tags, and end with <overallFeedback> In <thinking> tags, consider the teacher's rubric, and use it as guidelines detailing what you want to see in the student's essay. Return the score for each category of the rubric in <criteriaFeedback> tags. Inside of the <criteriaFeedback> tags write valid JSON. It should be structured like {"example_criteria": {"feedback": "insert_feedback_here", "score": "score/total_for_criteria"}}, keeping in mind the total possible score for each criteria. Return the fraction of points_scored / total_points on rubric in <finalScore> tags, and make sure to only return this fraction within these tags. Additionally write in <overallFeedback> tags a general summary of the essay, as well general feedback regxarding the rubric in contrast with the essay.</instructions>[/INST]
Rubric:
${rubric}

Essay:
${essayText}
`,
   

};

    const params = {
        modelId: "arn:aws:bedrock:us-east-1:954976296594:inference-profile/us.anthropic.claude-3-5-sonnet-20241022-v2:0", // Use the ARN from your inference profile
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