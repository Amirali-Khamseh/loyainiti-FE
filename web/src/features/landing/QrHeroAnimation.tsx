import React, { useMemo } from 'react';

// 11x11 module grid with a 3x3 finder square in each of three corners, like a
// real QR code - denser and smaller-celled than a first pass at this (fewer,
// bigger modules) so it reads more like an actual QR code up close.
const GRID = 11;
const CELL = 18;
const GAP = 2;
const SIZE = GRID * CELL;

// Cycle length of one full diagonal sweep. Kept in one place since both the
// keyframes and each module's delay need to agree on it.
const CYCLE_S = 3.2;

function isFinderZone(row: number, col: number): boolean {
  const topLeft = row < 3 && col < 3;
  const topRight = row < 3 && col >= GRID - 3;
  const bottomLeft = row >= GRID - 3 && col < 3;
  return topLeft || topRight || bottomLeft;
}

function FinderSquare({ x, y }: { x: number; y: number }) {
  const s = 3 * CELL - GAP;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={s} height={s} rx={7} fill="none" stroke="#FFFFFF" strokeWidth={4} />
      <rect x={s * 0.28} y={s * 0.28} width={s * 0.44} height={s * 0.44} rx={3} fill="#FFFFFF" />
    </g>
  );
}

/** A diagonal light sweep travels from the top-left corner to the bottom-right
 *  one and loops: every module shares the same pulse animation but offset by
 *  a delay proportional to its distance along the diagonal (plus a little
 *  jitter so it doesn't read as too mechanical), so the "on" band moves
 *  across the grid instead of the whole thing flickering independently. */
export function QrHeroAnimation() {
  const maxDiagonal = 2 * (GRID - 1);

  const cells = useMemo(() => {
    const list: { row: number; col: number; delay: number }[] = [];
    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        if (isFinderZone(row, col)) continue;
        const diagonal = row + col;
        const jitter = (Math.random() - 0.5) * 0.25;
        const delay = (diagonal / maxDiagonal) * CYCLE_S + jitter;
        list.push({ row, col, delay });
      }
    }
    return list;
  }, [maxDiagonal]);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="Animated illustration of a loyainiti QR loyalty code"
    >
      <style>{`
        @keyframes qrSweep {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 1; }
        }
      `}</style>
      {cells.map(({ row, col, delay }) => (
        <rect
          key={`${row}-${col}`}
          x={col * CELL}
          y={row * CELL}
          width={CELL - GAP}
          height={CELL - GAP}
          rx={3}
          fill="var(--cyan-500)"
          opacity={0.1}
          style={{
            animation: `qrSweep ${CYCLE_S}s ease-in-out infinite`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
      <FinderSquare x={0} y={0} />
      <FinderSquare x={(GRID - 3) * CELL} y={0} />
      <FinderSquare x={0} y={(GRID - 3) * CELL} />
    </svg>
  );
}
