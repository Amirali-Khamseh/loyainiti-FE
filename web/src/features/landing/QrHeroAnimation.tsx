import React, { useEffect, useMemo, useState } from 'react';

// 7x7 module grid with a 3x3 finder square in each of three corners, like a
// real QR code. Interior modules each run their own randomized on/dim/off
// timer so the grid animates organically instead of blinking in lockstep -
// a decorative nod to the real, scannable code on MyQrPage.
const GRID = 7;
const CELL = 30;
const GAP = 3;
const SIZE = GRID * CELL;

function isFinderZone(row: number, col: number): boolean {
  const topLeft = row < 3 && col < 3;
  const topRight = row < 3 && col >= GRID - 3;
  const bottomLeft = row >= GRID - 3 && col < 3;
  return topLeft || topRight || bottomLeft;
}

type ModuleState = 'on' | 'dim' | 'off';

function randomState(): ModuleState {
  const r = Math.random();
  if (r < 0.4) return 'on';
  if (r < 0.7) return 'dim';
  return 'off';
}

function opacityFor(state: ModuleState): number {
  if (state === 'on') return 1;
  if (state === 'dim') return 0.35;
  return 0.08;
}

function Module({ delay }: { delay: number }) {
  const [state, setState] = useState<ModuleState>(randomState);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const tick = () => {
      setState(randomState());
      timeoutId = setTimeout(tick, 900 + Math.random() * 2200);
    };
    timeoutId = setTimeout(tick, delay);
    return () => clearTimeout(timeoutId);
  }, [delay]);

  return (
    <rect
      width={CELL - GAP}
      height={CELL - GAP}
      rx={5}
      fill="var(--cyan-500)"
      opacity={opacityFor(state)}
      style={{ transition: 'opacity 700ms var(--ease-in-out)' }}
    />
  );
}

function FinderSquare({ x, y }: { x: number; y: number }) {
  const s = 3 * CELL - GAP;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={s} height={s} rx={9} fill="none" stroke="#FFFFFF" strokeWidth={6} />
      <rect x={s * 0.28} y={s * 0.28} width={s * 0.44} height={s * 0.44} rx={5} fill="#FFFFFF" />
    </g>
  );
}

export function QrHeroAnimation() {
  const cells = useMemo(() => {
    const list: { row: number; col: number; delay: number }[] = [];
    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        if (isFinderZone(row, col)) continue;
        list.push({ row, col, delay: Math.random() * 2000 });
      }
    }
    return list;
  }, []);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="Animated illustration of a loyainiti QR loyalty code"
    >
      {cells.map(({ row, col, delay }) => (
        <g key={`${row}-${col}`} transform={`translate(${col * CELL} ${row * CELL})`}>
          <Module delay={delay} />
        </g>
      ))}
      <FinderSquare x={0} y={0} />
      <FinderSquare x={(GRID - 3) * CELL} y={0} />
      <FinderSquare x={0} y={(GRID - 3) * CELL} />
    </svg>
  );
}
