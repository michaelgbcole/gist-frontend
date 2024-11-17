import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
    { quarter: '1st quarter', average: 75 },
    { quarter: '2nd quarter', average: 80 },
    { quarter: '3rd quarter', average: 93 },
    { quarter: '4th quarter', average: 87 }
  ];
  
export default function LineChart() {
    return(
        <Card className="w-[439px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[15px] text-[#333333] font-bold">
          Overall Class Average
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
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: -20,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 10, fill: '#333333' }}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                ticks={[50, 60, 70, 75, 80, 85, 90, 95, 100]}
                tick={{ fontSize: 10, fill: '#333333' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E5E5',
                  borderRadius: '6px',
                }}
                formatter={(value) => [`${value}%`]}
              />
              <Area
                type="monotone"
                dataKey="average"
                stroke="#6366F1"
                strokeWidth={2}
                fill="url(#colorGradient)"
                dot={{
                  fill: '#6366F1',
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  fill: '#6366F1',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
    )
}