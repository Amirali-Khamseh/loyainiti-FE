import React from 'react';

type LoyaltyStampProps = {
  /** Total stamps needed for a reward (the size of the row). */
  required: number;
  /** Stamps earned since last redemption. */
  earned: number;
  rewardLabel?: string;
};

/**
 * Row of stamp slots: empty circles for unearned, gold-foil "loyainiti" stamps for earned.
 * Mirrors the design-system component preview at design-system/components-preview/16-stamp-card.html.
 */
export function LoyaltyStamp({ required, earned, rewardLabel }: LoyaltyStampProps) {
  const slots = Array.from({ length: required }, (_, i) => i < earned);
  const rewardReady = earned >= required;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {slots.map((filled, i) => (
          <span
            key={i}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: filled ? 'var(--gold-500)' : 'transparent',
              border: filled ? '1px solid var(--gold-600)' : '1.5px dashed var(--paper-300)',
              color: filled ? 'var(--espresso-900)' : 'var(--paper-400)',
              font: 'var(--t-caption)',
              fontWeight: 600,
              transition: 'background var(--dur-3) var(--ease-out)',
            }}
          >
            {filled ? '★' : i + 1}
          </span>
        ))}
      </div>
      <p
        style={{
          font: 'var(--t-caption)',
          color: rewardReady ? 'var(--success)' : 'var(--fg-2)',
          margin: 0,
        }}
      >
        {rewardReady
          ? `🎉 Reward ready${rewardLabel ? ` — ${rewardLabel}` : ''}`
          : `${earned} / ${required} stamps${rewardLabel ? ` — ${rewardLabel}` : ''}`}
      </p>
    </div>
  );
}
