/**
 * Builds an .xlsx workbook from the same stats endpoints StatsPage uses,
 * for a fixed weekly/monthly window rather than whatever range is picked
 * on screen — so "download weekly report" always means the last 7 days.
 */
import * as XLSX from 'xlsx';
import { api } from './api';

export type ReportPeriod = 'weekly' | 'monthly';

type Summary = {
  range: { from: string; to: string };
  totalVisits: number;
  uniqueCustomers: number;
  newMembers: number;
  totalRedemptions: number;
  avgVisitsPerCustomer: number;
};

type Daily = {
  range: { from: string; to: string };
  series: Array<{ day: string; visits: number }>;
};

type TopCustomer = {
  customerId: string;
  displayName: string;
  email: string;
  visits: number;
  lastVisitAt: string;
};

function periodRange(period: ReportPeriod): { from: string; to: string } {
  const days = period === 'weekly' ? 7 : 30;
  const now = new Date();
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: past.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) };
}

export async function downloadStatsReport(businessId: string, period: ReportPeriod): Promise<void> {
  const range = periodRange(period);

  const [summary, daily, top] = await Promise.all([
    api<Summary>(`/api/businesses/${businessId}/stats/summary`, { query: range }),
    api<Daily>(`/api/businesses/${businessId}/stats/visits-daily`, { query: range }),
    api<TopCustomer[]>(`/api/businesses/${businessId}/stats/top-customers`, {
      query: { ...range, limit: 100 },
    }),
  ]);

  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.json_to_sheet([
    { Metric: 'Date range', Value: `${summary.range.from} to ${summary.range.to}` },
    { Metric: 'Total visits', Value: summary.totalVisits },
    { Metric: 'Unique customers', Value: summary.uniqueCustomers },
    { Metric: 'New members', Value: summary.newMembers },
    { Metric: 'Total redemptions', Value: summary.totalRedemptions },
    { Metric: 'Avg visits / customer', Value: summary.avgVisitsPerCustomer },
  ]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  const dailySheet = XLSX.utils.json_to_sheet(
    daily.series.map((row) => ({ Day: row.day, Visits: row.visits })),
  );
  XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Visits');

  const topSheet = XLSX.utils.json_to_sheet(
    top.map((c) => ({
      Customer: c.displayName,
      Email: c.email,
      Visits: c.visits,
      'Last visit': c.lastVisitAt,
    })),
  );
  XLSX.utils.book_append_sheet(workbook, topSheet, 'Top Customers');

  const label = period === 'weekly' ? 'weekly' : 'monthly';
  XLSX.writeFile(workbook, `stats-report-${label}-${range.to}.xlsx`);
}
