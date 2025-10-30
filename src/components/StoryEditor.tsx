import { useState, useRef } from "react";
import { StoryNode as StoryNodeType, Choice } from "../types/story";
import { StoryNode } from "./StoryNode";
import { NodeEditor } from "./NodeEditor";
import { Button } from "./ui/button";
import { Plus, Play, Save } from "lucide-react";

interface StoryEditorProps {
  nodes: StoryNodeType[];
  onNodesChange: (nodes: StoryNodeType[]) => void;
  onPreview: () => void;
}

export function StoryEditor({ nodes, onNodesChange, onPreview }: StoryEditorProps) {
  const [selectedNode, setSelectedNode] = useState<StoryNodeType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleAddNode = () => {
    const newNode: StoryNodeType = {
      id: `node-${Date.now()}`,
      title: "New Scene",
      content: "Enter your story text here...",
      choices: [],
      position: { x: 100, y: 100 },
      isStart: nodes.length === 0,
      isEnd: false,
    };
    onNodesChange([...nodes, newNode]);
  };

  const handleNodeClick = (node: StoryNodeType) => {
    setSelectedNode(node);
    setIsEditing(true);
  };

  const handleNodeUpdate = (updatedNode: StoryNodeType) => {
    const updatedNodes = nodes.map((n) =>
      n.id === updatedNode.id ? updatedNode : n
    );
    onNodesChange(updatedNodes);
    setSelectedNode(null);
    setIsEditing(false);
  };

  const handleNodeDelete = (nodeId: string) => {
    const updatedNodes = nodes.filter((n) => n.id !== nodeId);
    // Remove choices that point to deleted node
    const cleanedNodes = updatedNodes.map((n) => ({
      ...n,
      choices: n.choices.filter((c) => c.targetNodeId !== nodeId),
    }));
    onNodesChange(cleanedNodes);
    setSelectedNode(null);
    setIsEditing(false);
  };

  const handleNodeDragStart = (nodeId: string) => {
    setDraggedNode(nodeId);
  };

  const handleNodeDrag = (nodeId: string, x: number, y: number) => {
    const updatedNodes = nodes.map((n) =>
      n.id === nodeId ? { ...n, position: { x, y } } : n
    );
    onNodesChange(updatedNodes);
  };

  const handleNodeDragEnd = () => {
    setDraggedNode(null);
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    nodes.forEach((node) => {
      node.choices.forEach((choice, index) => {
        const targetNode = nodes.find((n) => n.id === choice.targetNodeId);
        if (targetNode) {
          const startX = node.position.x + 150;
          const startY = node.position.y + 80 + index * 20;
          const endX = targetNode.position.x;
          const endY = targetNode.position.y + 40;

          const midX = (startX + endX) / 2;
          
          const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

          connections.push(
            <g key={`${node.id}-${choice.id}`}>
              <path
                d={path}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        }
      });
    });

    return connections;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex gap-2">
          <Button onClick={handleAddNode}>
            <Plus className="w-4 h-4 mr-2" />
            Add Scene
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPreview}>
            <Play className="w-4 h-4 mr-2" />
            Preview Story
          </Button>
        </div>
      </div>

      <div className="flex-1 relative overflow-auto bg-slate-50" ref={canvasRef}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '2000px', minHeight: '2000px' }}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
            </marker>
          </defs>
          {renderConnections()}
        </svg>

        <div className="relative" style={{ minWidth: '2000px', minHeight: '2000px' }}>
          {nodes.map((node) => (
            <StoryNode
              key={node.id}
              node={node}
              onClick={handleNodeClick}
              onDragStart={handleNodeDragStart}
              onDrag={handleNodeDrag}
              onDragEnd={handleNodeDragEnd}
              isDragging={draggedNode === node.id}
            />
          ))}
        </div>
      </div>

      {isEditing && selectedNode && (
        <NodeEditor
          node={selectedNode}
          allNodes={nodes}
          onSave={handleNodeUpdate}
          onDelete={handleNodeDelete}
          onClose={() => {
            setIsEditing(false);
            setSelectedNode(null);
          }}
        />
      )}
    </div>
  );
}
