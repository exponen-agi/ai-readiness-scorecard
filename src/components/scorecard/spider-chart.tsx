'use client';

import React, { useState } from 'react';
import type { RadarDimension } from '@/lib/scorecard';

interface SpiderChartProps {
  dimensions: RadarDimension[];
  size?: number;
  showBenchmark?: boolean;
}

export function SpiderChart({
  dimensions,
  size = 380,
  showBenchmark = true,
}: SpiderChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const numAxes = dimensions.length;
  if (numAxes < 3) return null;

  const center = size / 2;
  const radius = (size / 2) * 0.68;
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Helper to convert polar coordinates to Cartesian
  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y, angle };
  };

  // Generate SVG polygon points for concentric grid levels
  const levelPolygons = levels.map((level) => {
    const points = dimensions
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x},${y}`;
      })
      .join(' ');
    return { level, points };
  });

  // Benchmark polygon (e.g. 80% across all pillars)
  const benchmarkPoints = dimensions
    .map((_, i) => {
      const { x, y } = getCoordinates(i, 0.8);
      return `${x},${y}`;
    })
    .join(' ');

  // Current score polygon points
  const dataPoints = dimensions
    .map((dim, i) => {
      const ratio = Math.max(0.1, Math.min(1, dim.score / 100));
      const { x, y } = getCoordinates(i, ratio);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible select-none"
        >
          <defs>
            <linearGradient id="scoreRadarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Concentric Grid Polygons */}
          {levelPolygons.map(({ level, points }) => (
            <polygon
              key={level}
              points={points}
              className="stroke-border fill-transparent"
              strokeWidth="1"
              strokeDasharray={level === 1.0 ? 'none' : '3 3'}
            />
          ))}

          {/* Radial Spokes */}
          {dimensions.map((_, i) => {
            const { x, y } = getCoordinates(i, 1.0);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                className="stroke-border/80"
                strokeWidth="1"
              />
            );
          })}

          {/* Benchmark Outline (80% production readiness guideline) */}
          {showBenchmark && (
            <polygon
              points={benchmarkPoints}
              fill="none"
              className="stroke-muted-foreground/40"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* User Score Filled Polygon */}
          <polygon
            points={dataPoints}
            fill="url(#scoreRadarGradient)"
            className="stroke-primary transition-all duration-700 ease-out"
            strokeWidth="2.5"
          />

          {/* Data Points / Vertices */}
          {dimensions.map((dim, i) => {
            const ratio = Math.max(0.1, Math.min(1, dim.score / 100));
            const { x, y } = getCoordinates(i, ratio);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={dim.key}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4.5}
                  className="fill-background stroke-primary transition-all duration-200"
                  strokeWidth={isHovered ? 3 : 2}
                />
              </g>
            );
          })}

          {/* Axis Labels & Values */}
          {dimensions.map((dim, i) => {
            const { x, y } = getCoordinates(i, 1.22);
            const isHovered = hoveredIndex === i;
            const isLeft = x < center - 10;
            const isRight = x > center + 10;
            const textAnchor = isLeft ? 'end' : isRight ? 'start' : 'middle';

            return (
              <g
                key={`label-${dim.key}`}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <text
                  x={x}
                  y={y - 6}
                  textAnchor={textAnchor}
                  className={`text-[11px] font-semibold transition-colors ${
                    isHovered ? 'fill-primary font-bold' : 'fill-foreground/80'
                  }`}
                >
                  {dim.label}
                </text>
                <text
                  x={x}
                  y={y + 8}
                  textAnchor={textAnchor}
                  className={`text-[10px] font-mono font-medium ${
                    isHovered ? 'fill-primary' : 'fill-foreground/60'
                  }`}
                >
                  {dim.score}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Detail Box on Hover or Default Note */}
      <div className="mt-2 min-h-[52px] w-full max-w-sm rounded-lg border border-border bg-background p-2.5 text-center text-xs">
        {hoveredIndex !== null ? (
          <div>
            <span className="font-semibold text-primary">
              {dimensions[hoveredIndex].label} ({dimensions[hoveredIndex].score}%):{' '}
            </span>
            <span className="text-foreground/75">
              {dimensions[hoveredIndex].description}
            </span>
          </div>
        ) : (
          <div className="text-foreground/60 flex items-center justify-center gap-2">
            <span>Hover on points to inspect each pillar</span>
            {showBenchmark && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px]">
                <span className="h-0.5 w-3 border-b border-dashed border-muted-foreground inline-block" />
                80% Benchmark
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
