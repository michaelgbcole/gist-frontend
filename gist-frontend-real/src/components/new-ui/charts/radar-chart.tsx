import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';


type PrismaUser = {
    id: string;
    email: string;
    name: string | null;
    isPayer: boolean;
  };

  type WritingMetricsChartProps = {
    user: any;
  };



const WritingMetricsChart: React.FC<WritingMetricsChartProps> = ({ user }) => {
   console.log('user', user) 

  const [data, setData] = React.useState<{ metric: string; value: number }[]>([]);

  useEffect(() => {
    const getData = async (userId: string) => {
        const response = await fetch('/api/radar-chart-data', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user }),
          });
          if (response.ok) {
            const data = await response.json();
            console.log('data', data.essayFeedback)

            setData(JSON.parse(data.essayFeedback));
          }
  
}
getData(user.id)
  }, [user])





  return (
    <Card className="w-[439px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[15px] text-[#333333] font-bold">
          Writing Metrics Breakdown
        </CardTitle>
        <Select defaultValue="overall">
          <SelectTrigger className="w-[100px] border-none shadow-none">
            <SelectValue placeholder="Overall" />
          </SelectTrigger>
        <SelectContent>
            <SelectItem value="overall">Overall</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              cx="50%" 
              cy="50%" 
              outerRadius="70%" 
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 30,
                bottom: 5,
              }}
            >
              <PolarGrid 
                gridType="polygon"
                stroke="#E5E5E5"
              />
              <PolarAngleAxis 
                dataKey="metric" 
                tick={{ 
                  fill: '#333333', 
                  fontSize: 10 
                }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[50, 100]}
                tick={{ 
                  fill: '#333333', 
                  fontSize: 10 
                }}
                tickCount={0}
                stroke="#E5E5E5"
              />
              <Radar 
                name="Skills" 
                dataKey="value" 
                stroke="#6366F1" 
                fill="#6366F1" 
                fillOpacity={0.3}
                dot={{
                  fill: '#6366F1',
                  r: 4,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WritingMetricsChart;