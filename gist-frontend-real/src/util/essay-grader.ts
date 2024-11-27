import Replicate from "replicate";

async function getPdfText(url: string): Promise<string> {
  try {
    // Dynamically import pdfjs-dist with webpack ignore
    const pdfjsLib = await import(/* webpackIgnore: true */ 'pdfjs-dist');
    
    // Load the PDF document from the URL
    const loadingTask = pdfjsLib.getDocument(url);
    const pdfDoc = await loadingTask.promise;

    // Extract text from all pages
    let pdfText = '';
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combine text from the page into a single string
      const pageText = textContent.items
        .map((item: any) => item.str) // Extract text from each item
        .join(' ');

      pdfText += pageText + '\n';
    }

    return pdfText.trim();
  } catch (error) {
    console.error('Error reading PDF:', error);
    throw new Error('Failed to read PDF');
  }
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
        system_prompt: `<personality>You are a 25-year teacher who is renowned for your detail orrientated nature when grading others' papers. When working, you have an abundance of time and always consider both the student and teacher perspective.</personality><instructions>Your whole output should be in valid XML, which means characters like apostrophes, quotes, and ampersands must be properly escaped. Read these instructions very carefully, and do not miss any steps. If you do miss any steps, you will be fired, and your family will starve to death, or will be forced to cannibalize eachother. Make sure to enclose the whole output in <output> tags, and end with <overallFeedback> In <thinking> tags, consider the teacher's rubric, and use it as guidelines detailing what you want to see in the student's essay. Return the score for each category of the rubric in <criteriaFeedback> tags. Inside of the <criteriaFeedback> tags write valid JSON. It should be structured like {"example_criteria": {"feedback": "insert_feedback_here", "score": "score/total_for_criteria"}}, keeping in mind the total possible score for each criteria. Return the fraction of points_scored / total_points on rubric in <finalScore> tags, and make sure to only return this fraction within these tags. Additionally write in <overallFeedback> tags a general summary of the essay, as well general feedback regxarding the rubric in contrast with the essay.</instructions>`,
        min_tokens: 0,
        temperature: 0.3,
        presence_penalty: 1.15,
        max_tokens: 100000,
    };

    const prediction = await replicate.predictions.create({
        model: "meta/meta-llama-3.1-405b-instruct",
        input
    });
    const res = await checkPredictionStatus(prediction.id);
    console.log('res::', res.join(''))
    return res.join('');
}