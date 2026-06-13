import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/Card';

export type TopCustomer = {
  customerId: string;
  displayName: string;
  email: string;
  visits: number;
  lastVisitAt: string;
};

type VisitsPage = {
  total: number;
  limit: number;
  offset: number;
  items: Array<{ visitId: string; scannedAt: string }>;
};

const PAGE_SIZE = 10;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

/**
 * Top customers as an accordion: each row expands to reveal that customer's
 * visits at this business, 10 at a time with prev/next pagination. The visit
 * list is fetched lazily (only when a row is opened) and scoped to the same
 * date range as the surrounding stats.
 */
export function TopCustomers({
  businessId,
  range,
  customers,
  isLoading,
}: {
  businessId: string;
  range: { from: string; to: string };
  customers: TopCustomer[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <h3 className="h3" style={{ marginBottom: 12 }}>
        Top customers
      </h3>
      {isLoading ? (
        <p className="body">Loading…</p>
      ) : customers.length === 0 ? (
        <p className="caption">No data for the selected period.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {customers.map((c, idx) => (
            <CustomerRow
              key={c.customerId}
              rank={idx + 1}
              customer={c}
              businessId={businessId}
              range={range}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function CustomerRow({
  rank,
  customer,
  businessId,
  range,
}: {
  rank: number;
  customer: TopCustomer;
  businessId: string;
  range: { from: string; to: string };
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  const visits = useQuery({
    queryKey: ['customer-visits', businessId, customer.customerId, range, page],
    queryFn: () =>
      api<VisitsPage>(
        `/api/businesses/${businessId}/stats/top-customers/${customer.customerId}/visits`,
        { query: { from: range.from, to: range.to, limit: PAGE_SIZE, offset: page * PAGE_SIZE } },
      ),
    enabled: open,
    placeholderData: keepPreviousData,
  });

  const total = visits.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div style={{ border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          padding: '10px 12px',
          background: 'var(--bg-card)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span className="num" style={{ width: 24, textAlign: 'right', color: 'var(--fg-3)' }}>
          {rank}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ font: 'var(--t-body)', margin: 0, color: 'var(--fg-1)' }}>
            {customer.displayName}
          </p>
          <p style={{ font: 'var(--t-caption)', margin: 0, color: 'var(--fg-3)' }}>
            {customer.email}
          </p>
        </div>
        <span className="num-lg">{customer.visits}</span>
        <ChevronDown
          size={16}
          color="var(--fg-3)"
          style={{
            flexShrink: 0,
            transition: 'transform var(--dur-1) var(--ease-out)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {open && (
        <div style={{ background: 'var(--bg-canvas)', padding: '8px 12px 12px' }}>
          {visits.isLoading ? (
            <p className="caption" style={{ padding: '8px 0' }}>
              Loading visits…
            </p>
          ) : total === 0 ? (
            <p className="caption" style={{ padding: '8px 0', color: 'var(--fg-3)' }}>
              No visits in this period.
            </p>
          ) : (
            <>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
                {visits.data?.items.map((v) => (
                  <li
                    key={v.visitId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ font: 'var(--t-body-sm)', color: 'var(--fg-2)' }}>
                      {fmtDate(v.scannedAt)}
                    </span>
                    <span className="brand-stamp" />
                  </li>
                ))}
              </ul>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}
              >
                <span className="caption" style={{ color: 'var(--fg-3)' }}>
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    style={pagerBtn(page === 0)}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    style={pagerBtn(page >= totalPages - 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function pagerBtn(disabled: boolean): React.CSSProperties {
  return {
    font: 'var(--t-body-sm)',
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid var(--border-default)',
    background: 'var(--bg-card)',
    color: disabled ? 'var(--fg-3)' : 'var(--fg-1)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}
