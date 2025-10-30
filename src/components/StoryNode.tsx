import { useState, useRef, useEffect } from "react";
import { StoryNode as StoryNodeType } from "../types/story";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { BookOpen, Circle } from "lucide-react";

interface StoryNodeProps {
  node: StoryNodeType;
  onClick: (node: StoryNodeType) => void;
  onDragStart: (nodeId: string) => void;
  onDrag: (nodeId: string, x: number, y: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export function StoryNode({
  node,
  onClick,
  onDragStart,
  onDrag,
  onDragEnd,
  isDragging,
}: StoryNodeProps) {
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDraggingLocal) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      onDrag(node.id, x, y);
    };

    const handleMouseUp = () => {
      setIsDraggingLocal(false);
      onDragEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingLocal, dragOffset, node.id, onDrag, onDragEnd]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      setDragOffset({ x: offsetX, y: offsetY });
      setIsDraggingLocal(true);
      onDragStart(node.id);
    }
    e.stopPropagation();
  };

  return (
    <div
      ref={nodeRef}
      className="absolute cursor-move"
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        width: '300px',
      }}
      onMouseDown={handleMouseDown}
    >
      <Card
        className={`p-4 shadow-lg hover:shadow-xl transition-shadow ${
          isDragging ? "opacity-70" : ""
        } ${node.isStart ? "border-green-500 border-2" : ""} ${
          node.isEnd ? "border-red-500 border-2" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-600" />
            <h3 className="text-slate-900">{node.title}</h3>
          </div>
          {node.isStart && <Badge variant="default">Start</Badge>}
          {node.isEnd && <Badge variant="destructive">End</Badge>}
        </div>

        <p className="text-slate-600 text-sm line-clamp-3 mb-3">
          {node.content}
        </p>

        {node.choices.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-slate-500 mb-1">Choices:</p>
            {node.choices.map((choice) => (
              <div
                key={choice.id}
                className="flex items-center gap-2 text-xs text-slate-600"
              >
                <Circle className="w-2 h-2 fill-current" />
                <span className="line-clamp-1">{choice.text}</span>
              </div>
            ))}
          </div>
        )}

        {node.choices.length === 0 && !node.isEnd && (
          <p className="text-xs text-amber-600">No choices defined</p>
        )}
      </Card>
    </div>
  );
}
