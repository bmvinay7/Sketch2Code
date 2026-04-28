"use client";

import { Arrow } from "react-konva";
import type { CanvasConnection, FlowShape } from "@/types/canvas";
import { denormalize } from "@/lib/shapes";

interface CanvasConnectionsProps {
  connections: CanvasConnection[];
  shapes: FlowShape[];
  width: number;
  height: number;
}

export function CanvasConnections({ connections, shapes, width, height }: CanvasConnectionsProps) {
  return (
    <>
      {connections.map((connection) => {
        const from = shapes.find((shape) => shape.id === connection.from);
        const to = shapes.find((shape) => shape.id === connection.to);
        if (!from || !to) return null;
        const a = denormalize(from, width, height);
        const b = denormalize(to, width, height);
        return (
          <Arrow
            key={connection.id}
            points={[
              a.x + a.width / 2,
              a.y + a.height / 2,
              b.x + b.width / 2,
              b.y + b.height / 2
            ]}
            pointerLength={10}
            pointerWidth={10}
            stroke="#22d3ee"
            fill="#22d3ee"
            strokeWidth={2}
            opacity={0.82}
          />
        );
      })}
    </>
  );
}
