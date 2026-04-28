"use client";

import { Circle, Group, Line, Rect, RegularPolygon, Text } from "react-konva";
import type { FlowShape } from "@/types/canvas";
import { denormalize, shapeMeta } from "@/lib/shapes";

interface FlowNodeProps {
  shape: FlowShape;
  canvasWidth: number;
  canvasHeight: number;
  isHovered: boolean;
  isTraceActive: boolean;
  onHover: (id: string | null) => void;
  onEdit: (shape: FlowShape) => void;
  onPortMouseDown: (id: string) => void;
  onShapeMouseUp: (id: string) => void;
  onMove: (id: string, dx: number, dy: number) => void;
}

export function FlowNode(props: FlowNodeProps) {
  const box = denormalize(props.shape, props.canvasWidth, props.canvasHeight);
  const meta = shapeMeta[props.shape.type];
  const fill = props.shape.isComplete ? meta.fill : `${meta.fill}73`;
  const dash = props.shape.isComplete ? undefined : [8, 6];
  const ports = [
    [box.x + box.width / 2, box.y],
    [box.x + box.width, box.y + box.height / 2],
    [box.x + box.width / 2, box.y + box.height],
    [box.x, box.y + box.height / 2]
  ];

  return (
    <Group
      draggable
      onMouseEnter={() => props.onHover(props.shape.id)}
      onMouseLeave={() => props.onHover(null)}
      onDblClick={() => props.onEdit(props.shape)}
      onMouseUp={() => props.onShapeMouseUp(props.shape.id)}
      onDragEnd={(event) => {
        props.onMove(props.shape.id, event.target.x(), event.target.y());
        event.target.position({ x: 0, y: 0 });
      }}
    >
      {props.isTraceActive && (
        <Rect
          x={box.x - 8}
          y={box.y - 8}
          width={box.width + 16}
          height={box.height + 16}
          cornerRadius={18}
          stroke="#ef4444"
          strokeWidth={3}
          opacity={0.85}
          shadowColor="#ef4444"
          shadowBlur={28}
        />
      )}
      {props.shape.type === "decision" ? (
        <RegularPolygon
          x={box.x + box.width / 2}
          y={box.y + box.height / 2}
          sides={4}
          radius={Math.min(box.width, box.height) * 0.68}
          rotation={45}
          fill={fill}
          stroke={meta.border}
          strokeWidth={2}
          dash={dash}
          opacity={props.shape.isComplete ? 0.92 : 0.45}
        />
      ) : (
        <Rect
          x={box.x}
          y={box.y}
          width={box.width}
          height={box.height}
          cornerRadius={props.shape.type === "start" || props.shape.type === "end" ? 22 : 10}
          fill={fill}
          stroke={meta.border}
          strokeWidth={2}
          dash={dash}
          opacity={props.shape.isComplete ? 0.92 : 0.45}
        />
      )}
      <Text
        x={box.x + 10}
        y={box.y + box.height / 2 - 9}
        width={box.width - 20}
        align="center"
        fill="#f8fafc"
        fontSize={13}
        fontStyle="bold"
        text={props.shape.label || "Double-click label"}
      />
      {props.isHovered &&
        ports.map(([x, y], index) => (
          <Circle
            key={index}
            x={x}
            y={y}
            radius={5}
            fill="#22d3ee"
            stroke="#cffafe"
            strokeWidth={1}
            onMouseDown={(event) => {
              event.cancelBubble = true;
              props.onPortMouseDown(props.shape.id);
            }}
          />
        ))}
    </Group>
  );
}
