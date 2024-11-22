import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardList,
  Pencil,
  PlusSquare,
  Save,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

type Criterion = {
  name: string;
  description: string;
  points: number;
};

type RubricCreatorProps = {
  userId: string;
};

const RubricCreator: React.FC<RubricCreatorProps> = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([
    { name: "", description: "", points: 0 },
  ]);

  const addCriterion = () => {
    setCriteria([{ name: "", description: "", points: 0 }, ...criteria]);
  };

  const removeCriterion = (index: number) => {
    const newCriteria = criteria.filter((_, i) => i !== index);
    setCriteria(newCriteria);
  };

  const updateCriterion = (
    index: number,
    field: keyof Criterion,
    value: string | number
  ) => {
    const newCriteria = [...criteria];
    newCriteria[index] = {
      ...newCriteria[index],
      [field]: field === "points" ? Number(value) || 0 : value,
    };
    setCriteria(newCriteria);
  };

  const handleConfirm = async () => {
    const totalPoints = criteria.reduce((sum, criterion) => sum + criterion.points, 0);
    const rubric = {
      title,
      total_points: totalPoints,
      criteria: criteria.filter((c) => c.name && c.description),
    };

    try {
      const response = await fetch(`/api/publish-rubric?userId=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rubric),
      });

      if (!response.ok) {
        throw new Error("Failed to publish rubric");
      }

      alert("Rubric published successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Error publishing rubric:", error);
      alert("Failed to publish rubric. Please try again.");
    }
  };

  const totalPoints = criteria.reduce((sum, criterion) => sum + criterion.points, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      <Button className="w-[216px] h-[42px] bg-[#8b5dffa6] hover:bg-[#8b5dffa6]/90 rounded-[20px] shadow-[0px_4px_4px_#00000040] flex items-center justify-center gap-2 font-bold">
  <ClipboardList className="w-6 h-[21px]" />
  <span className="text-[17px] tracking-[-0.51px]">Create Rubric</span>
</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-[800px] h-[90vh] p-0">
        <div className="h-full overflow-y-auto">

            <CardHeader className="p-8">
              <div className="bg-[#7047d9] rounded-md shadow-md p-4">
                <h1 className="text-3xl font-bold text-center text-white tracking-tight">
                  Rubric Creator
                </h1>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 px-8">
              <div className="space-y-2">
                <label className="font-bold text-[#09080c91] text-sm">
                  Rubric Title
                </label>
                <div className="flex gap-4">
                  <Input
                    placeholder="Rubric Title goes here..."
                    className="flex-1 border-[#92929233]"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              {criteria.map((criterion, index) => (
                <Card key={index} className="border-[#92929226] shadow-md">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 flex items-center gap-2 bg-white rounded-md border border-[#92929233] p-2">
                        <ClipboardList className="w-5 h-5" />
                        <Input
                          placeholder="Category name"
                          className="border-0 bg-transparent focus:outline-none focus:ring-0"
                          value={criterion.name}
                          onChange={(e) =>
                            updateCriterion(index, "name", e.target.value)
                          }
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#7b58d1]">Points:</span>
                        <Input
                          type="number"
                          className="bg-[#8b5dff] text-white w-12 h-9 rounded-md shadow-md flex items-center justify-center font-bold text-center p-2"
                          value={criterion.points}
                          min="0"
                          onChange={(e) =>
                            updateCriterion(index, "points", e.target.value)
                          }
                        />
                        <Button
                          variant="ghost"
                          className="bg-[#8b5dff] hover:bg-[#8b5dff]/90 h-9 w-9 p-0"
                          onClick={() => removeCriterion(index)}
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    </div>

                    <div className="relative">
                      <Pencil className="absolute left-3 top-3 w-5 h-5" />
                      <Textarea
                        placeholder="Category Description"
                        className="min-h-[100px] pl-12 border-[#92929233] focus:ring-0"
                        value={criterion.description}
                        onChange={(e) =>
                          updateCriterion(index, "description", e.target.value)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>

            <Separator className="bg-[#d9d9d9b2]" />

            <CardFooter className="p-8 flex items-center justify-between">
              <span className="font-bold text-[#05050599]">
                Total Points: {totalPoints}
              </span>

              <div className="flex gap-4">
                <Button
                  className="bg-[#8b5dff] hover:bg-[#8b5dff]/90 text-white font-bold px-8"
                  onClick={handleConfirm}
                >
                  <Save className="w-5 h-5 mr-2" />
                  Confirm Rubric
                </Button>

                <Button
                  className="bg-[#527ef0] hover:bg-[#527ef0]/90 text-white font-bold"
                  onClick={addCriterion}
                >
                  <PlusSquare className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardFooter>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RubricCreator;