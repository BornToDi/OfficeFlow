"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"
import type { Bill } from "@/lib/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

interface StatusPieChartProps {
    bills: Bill[];
}

const chartConfig = {
  count: {
    label: "Bills",
  },
  SUBMITTED: {
    label: "Submitted",
    color: "hsl(var(--chart-1))",
  },
  APPROVED: {
    label: "Approved",
    color: "hsl(var(--chart-2))",
  },
  PAID: {
    label: "Paid",
    color: "hsl(var(--chart-3))",
  },
  REJECTED: {
    label: "Rejected",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function StatusPieChart({ bills }: StatusPieChartProps) {
  const data = React.useMemo(() => {
    const statusCounts = {
      SUBMITTED: 0,
      APPROVED: 0,
      PAID: 0,
      REJECTED: 0,
    };

    bills.forEach(bill => {
      if (bill.status.startsWith('REJECTED')) {
        statusCounts.REJECTED++;
      } else if (bill.status === 'PAID') {
        statusCounts.PAID++;
      } else if (bill.status.startsWith('APPROVED')) {
        statusCounts.APPROVED++;
      } else if (bill.status === 'SUBMITTED') {
        statusCounts.SUBMITTED++;
      }
    });

    return [
      { status: 'SUBMITTED', count: statusCounts.SUBMITTED, fill: 'var(--color-SUBMITTED)' },
      { status: 'APPROVED', count: statusCounts.APPROVED, fill: 'var(--color-APPROVED)' },
      { status: 'PAID', count: statusCounts.PAID, fill: 'var(--color-PAID)' },
      { status: 'REJECTED', count: statusCounts.REJECTED, fill: 'var(--color-REJECTED)' },
    ].filter(item => item.count > 0);
  }, [bills]);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel nameKey="status" />}
        />
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          innerRadius={60}
          strokeWidth={5}
        />
        <ChartLegend content={<ChartLegendContent nameKey="status" />} />
      </PieChart>
    </ChartContainer>
  )
}
