"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AuthWrapper from '@/components/AuthWrapper';
import Frame from '@/components/new-ui/main-frame';
import LineChart from '@/components/new-ui/charts/line-chart';

const Dashboard = () => {
  const data = [
    { quarter: '1st quarter', average: 75 },
    { quarter: '2nd quarter', average: 80 },
    { quarter: '3rd quarter', average: 93 },
    { quarter: '4th quarter', average: 87 }
  ];

  return (
    <AuthWrapper>
        <Frame>
        <LineChart />
    </Frame>
    </AuthWrapper>
  );
};

export default Dashboard;