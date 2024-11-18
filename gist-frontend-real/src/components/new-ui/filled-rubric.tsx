import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React from "react";

type criteriaData = {
    label: string;
    feedback: string;
    score: string;
};

interface FilledRubricProps { 
    criteriaData: criteriaData[];
    }


// const criteriaData = [
//     {
//         label: "Topic Sentence",
//         content: "FWAEH",
//         score: "4/4",
//         bgColor: "bg-[#52e2b5]",
//     },
//     {
//         label: "Evidence",
//         content: "your bitch ass ain't giving no evidence",
//         score: "0/5",
//         bgColor: "bg-[#76b4ff]",
//     },
//     {
//         label: "Analysis",
//         content: "how you gon analyze if you didn't give evidence.",
//         score: "0/6",
//         bgColor: "bg-[#ff8c8a]",
//     },
//     {
//         label: "Grammar & Mechanics",
//         content: "Yeah nah, I don't really fw grammar like that.",
//         score: "2/3",
//         bgColor: "bg-[#ffad67]",
//     },
//     {
//         label: "Transitions",
//         content: "I only transition genders",
//         score: "1/2",
//         bgColor: "bg-[#eda1f1]",
//     },
// ];

const bgColors = [
    "bg-[#52e2b5]",
    "bg-[#76b4ff]",
    "bg-[#ff8c8a]",
    "bg-[#ffad67]",
    "bg-[#eda1f1]",
];

export default function FilledRubric( { criteriaData } : FilledRubricProps) {



    return (
        <Card className="w-[772px] rounded-[20px] bg-[#8b5dff0a] border-[#92929233] shadow-[0px_4px_4px_#00000040]">
            <CardContent className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-semibold">What needs to be worked on</h1>
                    <div className="flex items-center gap-4">
                        {/* <Button
                            variant="outline"
                            className="rounded-full border-[#8b5dff] text-[#8b5dff]"
                        >
                            Open Rubric
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full border-[#8b5dff] text-[#8b5dff]"
                        >
                            Regrade
                        </Button> */}
                    
                    </div>
                </div>
                <div className="grid grid-cols-[1fr_3fr_1fr] gap-4 mb-4">
                    <span className="font-semibold text-[#666666]">Criteria</span>
                    <span className="font-semibold text-[#666666]">Description</span>
                    <span className="font-semibold text-[#666666] text-right">Score</span>
                </div>
                {criteriaData.map((item, index) => (
                    <React.Fragment key={index}>
                        <div className="grid grid-cols-[1fr_3fr_1fr] gap-4 py-4">
                            <Badge
                                className={`${bgColors[index]} text-white w-fit px-4 py-2 rounded-xl`}
                            >
                                {item.label}
                            </Badge>
                            <p className="font-semibold text-[#444444] text-[15px] pt-2">
                                {item.feedback}
                            </p>
                            <div
                                className={`${bgColors[index]} w-[43px] h-[43px] rounded-full ml-auto flex items-center justify-center`}
                            >
                                <span className="text-white font-bold">{item.score}</span>
                            </div>
                        </div>
                        {index < criteriaData.length - 1 && <Separator />}
                    </React.Fragment>
                ))}
            </CardContent>
        </Card>
    );
}