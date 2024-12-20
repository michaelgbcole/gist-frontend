import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import React from "react";

const generatePastelColor = (index: number) => {
  const hues = [
    { h: 280, s: 60, l: 80 }, // Lavender
    { h: 35, s: 80, l: 80 },  // Peach
    { h: 130, s: 50, l: 80 }, // Mint
    { h: 180, s: 50, l: 80 }, // Light Blue
    { h: 330, s: 60, l: 80 }, // Pink
    { h: 60, s: 70, l: 80 },  // Light Yellow
  ];
  
  const colorIndex = index % hues.length;
  const { h, s, l } = hues[colorIndex];
  return `hsl(${h}, ${s}%, ${l}%)`;
};

interface FeedbackItem {
  feedback: string;
  id: number;
  score: string;
  title: string;
}

interface FrameProps {
  essays: FeedbackItem[];
  maxHeight?: string;
  onDetailsClick?: (essayId: number) => void;
}

export default function Quickview({ essays, maxHeight = "600px", onDetailsClick }: FrameProps): JSX.Element {
  const totalEssays = essays.length;
  const columns = 4;
  const rows = Math.ceil(totalEssays / columns);

  return (
    <Card className="w-[1000px] bg-white rounded-[20px]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="text-xs text-[#333333b5] font-bold mb-4">
            Essays Feedback
          </div>
        </div>
        <div 
          className="overflow-y-auto overflow-x-hidden"
          style={{ maxHeight }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 min-w-0">
            {essays.map((essay, index) => {
              const bgColor = generatePastelColor(index);
              const currentRow = Math.floor(index / columns);
              const isLastColumn = (index + 1) % columns !== 0;
              const showHorizontalDivider = currentRow > 0 && currentRow < rows;
              
              return (
                <div key={essay.id} className="relative min-w-0 p-6 pb-10">
                  {/* Vertical divider (not for last column) */}
                  {isLastColumn && (
                    <div className="absolute top-0 right-0 bottom-0 w-px bg-gray-200" />
                  )}
                  
                  {/* Horizontal divider (not for first row) */}
                  {showHorizontalDivider && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gray-200" />
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      className="w-[35px] h-[35px] rounded-full flex-shrink-0 flex items-center justify-center text-white text-xl font-bold"
                      style={{ backgroundColor: bgColor }}
                    >
                      {index +1}
                    </Badge>
                    <span className="font-bold text-base text-[#000000cc] truncate">
                      {essay.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-white font-bold py-1 px-4"
                      style={{ backgroundColor: bgColor }}
                    >
                      {essay.score}
                    </Badge>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 rounded-full border shadow"
                      style={{ borderColor: bgColor, color: bgColor }}
                      onClick={() => onDetailsClick?.(essay.id)}
                    >
                      <Info className="h-4 w-4" />
                      <span className="text-xs font-bold">Details</span>
                    </Button>
                  </div>
                  <p className="text-sm text-[#333333] font-bold tracking-[-0.42px] text-left line-clamp-4">
                    {essay.feedback}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}