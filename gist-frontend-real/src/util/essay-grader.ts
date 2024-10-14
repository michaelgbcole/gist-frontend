import { pdfjs } from "react-pdf";
import Replicate from "replicate";



const pdf = require('pdf-parse');

async function getPdfText(pdfUrl: string): Promise<string> {
  const response = await fetch(pdfUrl);
  const arrayBuffer = await response.arrayBuffer();
  const data = await pdf(arrayBuffer);
  console.log('data 4 real', data.text)
  return data.text;  // This contains the text of the PDF
}



const replicate = new Replicate();
async function checkPredictionStatus(prediction_id: string): Promise<any> {
    while (true) {
        const prediction_status = await replicate.predictions.get(prediction_id);
        if (prediction_status.status === "succeeded") {
            console.log('prediction_status', prediction_status)
            return prediction_status.output as string;
        } else if (prediction_status.status === "failed") {
            throw new Error("Prediction failed");
        }
        // Wait for a short period before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

export default async function gradeEssay(essayPublicUrl: string, rubric: string): Promise<string> {
    console.log('essayPublicUrlrealrealreal', essayPublicUrl)
    const essayText = await getPdfText(essayPublicUrl);
    console.log('essayText', essayText)

    console.log('grading')
    const input = {
        top_p: 0.9,
        prompt: `This is the teacher's ${rubric}:  This is the student's essay: ${essayText}.`,
        system_prompt: "<personality>You are a 25-year teacher who is renowned for your detail orrientated nature when grading others' papers. When working, you have an abundance of time and always consider both the student and teacher perspective.</personality><instructions>Your whole output should be in valid XML. Read these instructions very carefully, and do not miss any steps. If you do miss any steps, you will be fired, and your family will starve to death, or will be forced to cannibalize eachother. Make sure to enclose the whole output in <output> tags, and end with <overallFeedback> In <thinking> tags, consider the teacher's rubric, and use it as guidelines detailing what you want to see in the student's essay. Return the fraction of points scored / total possible points on rubric in <finalScore> tags, and return the score for each category of the rubric in <criteriaFeedback> tags. Inside of the <criteriaFeedback> tags write valid json with the objects {criteria, feedback, score}, keeping in mind the initial score for each one. Additionally write in <overallFeedback> tags a general summary of the essay, as well general feedback regarding the rubric in contrast with the essay.</instructions>",
        min_tokens: 0,
        temperature: 0.3,
        presence_penalty: 1.15
    };

    const prediction = await replicate.predictions.create({
        model: "meta/meta-llama-3.1-405b-instruct",
        input
    });
    const res = await checkPredictionStatus(prediction.id);
    console.log('res::', res.join(''))
    return res.join('');
}