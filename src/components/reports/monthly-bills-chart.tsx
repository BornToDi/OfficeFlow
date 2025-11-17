"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import type { Bill } from "@/lib/types"
import { format } from 'date-fns';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface MonthlyBillsChartProps {
    bills: Bill[];
}

const chartConfig = {
  bills: {
    label: "Bills",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function MonthlyBillsChart({ bills }: MonthlyBillsChartProps) {
  const data = React.useMemo(() => {
    const monthlyCounts: { [key: string]: number } = {};
    
    bills.forEach(bill => {
      const month = format(new Date(bill.createdAt), 'MMM yyyy');
      if (!monthlyCounts[month]) {
        monthlyCounts[month] = 0;
      }
      monthlyCounts[month]++;
    });

    const sortedMonths = Object.keys(monthlyCounts).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
    });

    return sortedMonths.slice(-12).map(month => ({
      month,
      bills: monthlyCounts[month],
    }));
  }, [bills]);

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
         <YAxis allowDecimals={false} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="bills" fill="var(--color-bills)" radius={8} />
      </BarChart>
    </ChartContainer>
  )
}
