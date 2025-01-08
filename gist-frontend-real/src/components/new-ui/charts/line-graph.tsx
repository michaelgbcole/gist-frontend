import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataEntry {
  date: string;
  timestamp: number;
  avgGrade: number;
  [key: string]: number | string; // For dynamic keys
}

interface TimeUnit {
  format: (date: string) => string;
  interval: number;
}

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all';
type MetricType = 'avgGrade' | 'rubric';
type RubricType = string;
type RubricCriteria = string;
type Scope = 'all' | 'Class 1' | 'Class 2' | 'Class 3';

const timeRanges: Record<TimeRange, number | null> = {
  'week': 7,
  'month': 30,
  'quarter': 90,
  'year': 365,
  'all': null
};

const timeUnits: Record<string, TimeUnit> = {
  'day': {
    format: (date: string) => new Date(date).toLocaleDateString(),
    interval: 1
  },
  'week': {
    format: (date: string) => `Week ${Math.ceil((new Date(date).getDate()) / 7)}`,
    interval: 7
  },
  'month': {
    format: (date: string) => new Date(date).toLocaleDateString(undefined, { month: 'short' }),
    interval: 30
  }
};

interface StudentAssignment {
  assignmentId: string;
  grade: number;
  rubricId: string;
  date?: string; // You might want to add this to your input data
  rubricData: {
    [criteria: string]: number;  // e.g., grammar: 0.59
  };
}

interface StudentData {
  id: string;
  name: string;
  class: string;
  assignmentData: StudentAssignment[];
}

interface PerformanceChartProps {
  data?: StudentData[];
  loading?: boolean;
}

const transformStudentData = (studentData: StudentData[]): DataEntry[] => {
  // Group all assignments by date
  const assignmentsByDate = new Map<string, {
    assignments: StudentAssignment[];
    classes: Set<string>;
  }>();

  studentData.forEach(student => {
    student.assignmentData.forEach(assignment => {
      const date = assignment.date || new Date(assignment.assignmentId).toISOString(); // fallback if no date
      if (!assignmentsByDate.has(date)) {
        assignmentsByDate.set(date, { assignments: [], classes: new Set() });
      }
      assignmentsByDate.get(date)!.assignments.push(assignment);
      assignmentsByDate.get(date)!.classes.add(student.class);
    });
  });

  // Convert to DataEntry format
  return Array.from(assignmentsByDate.entries()).map(([date, { assignments, classes }]) => {
    const entry: DataEntry = {
      date,
      timestamp: new Date(date).getTime(),
      avgGrade: 0
    };

    // Calculate class averages
    Array.from(classes).forEach(className => {
      const classAssignments = assignments.filter(a => 
        studentData.find(s => s.assignmentData.includes(a))?.class === className
      );
      entry[`${className}_grade`] = 
        classAssignments.reduce((sum, a) => sum + a.grade, 0) / classAssignments.length;
    });

    // Calculate overall average
    entry.avgGrade = Array.from(classes).reduce((sum, className) => 
      sum + (entry[`${className}_grade`] as number), 0) / classes.size;

    // Calculate rubric averages - now dynamic based on the data
    assignments.forEach(assignment => {
      Object.entries(assignment.rubricData).forEach(([criteria, score]) => {
        const key = `${assignment.rubricId}_${criteria}`;
        if (!(key in entry)) {
          entry[key] = score * 100;  // Initialize if first encounter
        } else {
          // Average with existing value
          entry[key] = ((entry[key] as number) + score * 100) / 2;
        }
      });
    });

    return entry;
  }).sort((a, b) => a.timestamp - b.timestamp);
};

const calculateClassAverage = (data: DataEntry[]): number => {
  const classGrades = ['Class 1', 'Class 2', 'Class 3'].map(className => 
    data.reduce((sum, entry) => sum + (entry[`${className}_grade`] as number), 0) / data.length
  );
  return classGrades.reduce((sum, grade) => sum + grade, 0) / classGrades.length;
};

const calculateRubricAverage = (data: DataEntry[], rubric: RubricType, criteria: RubricCriteria): number => {
  return data.reduce((sum, entry) => sum + (entry[`${rubric}_${criteria}`] as number), 0) / data.length;
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, loading = false }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [timeUnit, setTimeUnit] = useState<string>('day');
  const [metric, setMetric] = useState<MetricType>('avgGrade');
  const [scope, setScope] = useState<Scope>('all');
  const [rubric, setRubric] = useState<RubricType>('writing');
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriteria>('overall');

  const allData = useMemo(() => transformStudentData(data || []), [data]);

  const filteredData = useMemo(() => {
    const metrics = {
      avgGrade: { min: 65, max: 98 },
      rubricGrades: {
        writing: {
          overall: { min: 70, max: 95 },
          grammar: { min: 60, max: 90 },
          organization: { min: 65, max: 92 },
          evidence: { min: 70, max: 94 },
          analysis: { min: 68, max: 96 }
        },
        presentation: {
          overall: { min: 75, max: 96 },
          delivery: { min: 70, max: 92 },
          visuals: { min: 72, max: 94 },
          engagement: { min: 68, max: 93 },
          timing: { min: 75, max: 95 }
        }
      }
    };

    let data = [...allData];
    
    // Filter by time range
    if (timeRanges[timeRange]) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (timeRanges[timeRange] as number));
      data = data.filter(entry => new Date(entry.date) > cutoffDate);
    }

    // Group by time unit if needed
    if (timeUnit !== 'day') {
      const groupedData: DataEntry[] = [];
      let currentGroup: DataEntry[] = [];
      const interval = timeUnits[timeUnit].interval;

      data.forEach((entry, index) => {
        currentGroup.push(entry);
        if ((index + 1) % interval === 0 || index === data.length - 1) {
          const avgEntry: DataEntry = {
            date: currentGroup[0].date,
            timestamp: currentGroup[0].timestamp,
            avgGrade: calculateClassAverage(currentGroup)
          };

          // Calculate averages for all metrics
          Object.entries(metrics.rubricGrades).forEach(([rubricName, rubricData]) => {
            Object.keys(rubricData).forEach((criteriaName) => {
              avgEntry[`${rubricName}_${criteriaName}`] = calculateRubricAverage(
                currentGroup,
                rubricName as RubricType,
                criteriaName as RubricCriteria
              );
            });
          });

          // Calculate class-specific averages
          ['Class 1', 'Class 2', 'Class 3'].forEach(className => {
            avgEntry[`${className}_grade`] = currentGroup.reduce(
              (sum, entry) => sum + (entry[`${className}_grade`] as number), 0
            ) / currentGroup.length;
          });

          groupedData.push(avgEntry);
          currentGroup = [];
        }
      });
      data = groupedData;
    }

    return data;
  }, [allData, timeRange, timeUnit]);

  const getDisplayValue = (entry: DataEntry): number => {
    if (!entry) return 0;
    
    if (metric === 'avgGrade') {
      if (scope === 'all') {
        // Calculate overall average across all classes
        return ['Class 1', 'Class 2', 'Class 3'].reduce(
          (sum, className) => sum + (entry[`${className}_grade`] as number), 0
        ) / 3;
      }
      return (entry[`${scope}_grade`] as number) || 0;
    }
    return (entry[`${rubric}_${rubricCriteria}`] as number) || 0;
  };

  const getMetricName = (): string => {
    if (metric === 'avgGrade') {
      return scope === 'all' ? 'Average Grade' : `${scope} Grade`;
    }
    return `${rubric} - ${rubricCriteria}`;
  };

  // Get available rubrics and their criteria from the data
  const rubricOptions = useMemo(() => {
    const rubrics = new Map<string, Set<string>>();
    
    data?.forEach(student => {
      student.assignmentData.forEach(assignment => {
        if (!rubrics.has(assignment.rubricId)) {
          rubrics.set(assignment.rubricId, new Set());
        }
        Object.keys(assignment.rubricData).forEach(criteria => {
          rubrics.get(assignment.rubricId)!.add(criteria);
        });
      });
    });

    return Object.fromEntries(
      Array.from(rubrics.entries()).map(([id, criteriaSet]) => [
        id,
        Array.from(criteriaSet)
      ])
    );
  }, [data]);

  if (loading || !data) {
    return (
      <Card className="w-full bg-white">
        <CardHeader>
          <CardTitle className="text-purple-700">Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full flex items-center justify-center bg-gray-50 text-gray-400 text-lg font-medium">
            {loading ? "Loading data..." : "No data found"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-purple-700">Performance Analysis</CardTitle>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Time Range</label>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(timeRanges).map(range => (
                  <SelectItem key={range} value={range} className="cursor-pointer">
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Time Unit</label>
            <Select value={timeUnit} onValueChange={setTimeUnit}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time Unit" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(timeUnits).map(unit => (
                  <SelectItem key={unit} value={unit} className="cursor-pointer">
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Metric Type</label>
            <Select value={metric} onValueChange={(value) => setMetric(value as MetricType)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avgGrade">Grade</SelectItem>
                <SelectItem value="rubric">Rubric</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {metric === 'rubric' && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Rubric Type</label>
                <Select value={rubric} onValueChange={(value) => setRubric(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Rubric" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(rubricOptions).map((rubricId) => (
                      <SelectItem key={rubricId} value={rubricId}>
                        {rubricId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Criteria</label>
                <Select 
                  value={rubricCriteria} 
                  onValueChange={(value) => setRubricCriteria(value)}
                  disabled={!rubric}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Criteria" />
                  </SelectTrigger>
                  <SelectContent>
                    {rubric && rubricOptions[rubric]?.map((criteria) => (
                      <SelectItem key={criteria} value={criteria}>
                        {criteria.charAt(0).toUpperCase() + criteria.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {metric === 'avgGrade' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={scope} onValueChange={(value) => setScope(value as Scope)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="Class 1">Class 1</SelectItem>
                  <SelectItem value="Class 2">Class 2</SelectItem>
                  <SelectItem value="Class 3">Class 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => timeUnits[timeUnit].format(date)}
                type="category"
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value: number) => [`${value.toFixed(1)}%`, getMetricName()]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={getDisplayValue}
                name={getMetricName()}
                stroke="#9333ea"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;