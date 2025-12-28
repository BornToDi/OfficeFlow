// src/components/reports/reports-dashboard.tsx
"use client";

type StatusAgg = {
  [status: string]: { count: number; total: number };
};

export function ReportsDashboard(props: {
  totals: { count: number; amount: number };
  statusMap: StatusAgg;
  funnel: { label: string; count: number; pct: number }[];
  trend: { ym: string; total: number; count: number }[];
}) {
  const { totals, statusMap, funnel, trend } = props;

  const niceCurrency = (n: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-8">
      {/* KPI header */}
      <section className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total Bills"
          value={String(totals.count)}
          sub={niceCurrency(totals.amount)}
        />
        <KpiCard
          title="Paid"
          value={String(statusMap.PAID?.count ?? 0)}
          sub={niceCurrency(statusMap.PAID?.total ?? 0)}
        />
        <KpiCard
          title="Rejected"
          value={String(
            (statusMap.REJECTED_BY_SUPERVISOR?.count ?? 0) +
              (statusMap.REJECTED_BY_ACCOUNTS?.count ?? 0) +
              (statusMap.REJECTED_BY_MANAGEMENT?.count ?? 0)
          )}
          sub={niceCurrency(
            (statusMap.REJECTED_BY_SUPERVISOR?.total ?? 0) +
              (statusMap.REJECTED_BY_ACCOUNTS?.total ?? 0) +
              (statusMap.REJECTED_BY_MANAGEMENT?.total ?? 0)
          )}
        />
      </section>

      {/* Ratio cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {funnel.map((f) => (
          <RatioCard key={f.label} label={f.label} count={f.count} pct={f.pct} />
        ))}
      </section>

      {/* Status breakdown table with micro bars */}
      <section className="rounded-2xl border bg-background p-4">
        <h3 className="mb-4 text-base font-semibold">Status Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-[520px] w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Count</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2">Share</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(statusMap).map(([key, v]) => {
                const share =
                  totals.count > 0 ? Math.round((v.count / totals.count) * 100) : 0;
                return (
                  <tr key={key} className="border-t">
                    <td className="py-2 pr-4 font-medium">{key}</td>
                    <td className="py-2 pr-4">{v.count}</td>
                    <td className="py-2 pr-4">{niceCurrency(v.total)}</td>
                    <td className="py-2">
                      <Bar share={share} label={`${share}%`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Simple 6-month trend (count) */}
      <section className="rounded-2xl border bg-background p-4">
        <h3 className="mb-4 text-base font-semibold">Last 6 Months (Count)</h3>
        <div className="grid grid-cols-6 gap-3">
          {trend.map((t) => (
            <div key={t.ym} className="flex flex-col items-stretch">
              <div className="h-28 rounded-lg border p-2 flex items-end">
                <div
                  className="w-full rounded bg-blue-500/90"
                  style={{
                    height: `${scale(t.count, trend)}%`,
                    transition: "height .4s",
                  }}
                  title={`${t.count} bills`}
                />
              </div>
              <div className="mt-2 text-center text-xs text-black">
                {t.ym}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function KpiCard(props: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="text-sm text-muted-foreground">{props.title}</div>
      <div className="mt-1 text-2xl font-semibold">{props.value}</div>
      {props.sub && (
        <div className="mt-1 text-xs text-muted-foreground">{props.sub}</div>
      )}
    </div>
  );
}

function RatioCard(props: { label: string; count: number; pct: number }) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{props.label}</div>
        <div className="text-sm text-muted-foreground">{props.count}</div>
      </div>
      <div className="mt-2 h-2 w-full rounded-full ">
        <div
          className="h-2 rounded-full bg-blue-500/90"
          style={{ width: `${Math.min(100, Math.max(0, props.pct))}%` }}
        />
      </div>
      <div className="mt-1 text-right text-xs text-muted-foreground">
        {props.pct}% of total
      </div>
    </div>
  );
}

function Bar(props: { share: number; label?: string }) {
  const w = Math.min(100, Math.max(0, props.share));
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-blue-500/90" style={{ width: `${w}%` }} />
      </div>
      <span className="w-10 text-right text-xs text-muted-foreground">
        {props.label ?? `${w}%`}
      </span>
    </div>
  );
}

function scale(v: number, arr: { count: number }[]) {
  const max = Math.max(1, ...arr.map((x) => x.count));
  return Math.round((v / max) * 100);
}
