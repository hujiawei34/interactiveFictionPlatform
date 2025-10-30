import { useState, useEffect } from "react";
import { StoryNode } from "../types/story";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface StoryPreviewProps {
  nodes: StoryNode[];
  onBack: () => void;
}

export function StoryPreview({ nodes, onBack }: StoryPreviewProps) {
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const startNode = nodes.find((n) => n.isStart);
    if (startNode) {
      setCurrentNode(startNode);
      setHistory([startNode.id]);
    }
  }, [nodes]);

  const handleChoiceClick = (targetNodeId: string) => {
    const nextNode = nodes.find((n) => n.id === targetNodeId);
    if (nextNode) {
      setCurrentNode(nextNode);
      setHistory([...history, nextNode.id]);
    }
  };

  const handleRestart = () => {
    const startNode = nodes.find((n) => n.isStart);
    if (startNode) {
      setCurrentNode(startNode);
      setHistory([startNode.id]);
    }
  };

  if (!currentNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-slate-900 mb-4">No Starting Scene</h2>
          <p className="text-slate-600 mb-4">
            Please mark one of your scenes as the starting scene in the editor.
          </p>
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Editor
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Editor
        </Button>
        <Button variant="outline" onClick={handleRestart}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart
        </Button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-slate-900 mb-4">{currentNode.title}</h2>
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {currentNode.content}
              </div>
            </div>

            {currentNode.isEnd && (
              <div className="mt-8 p-4 bg-slate-100 rounded-lg text-center">
                <p className="text-slate-700 mb-4">The End</p>
                <Button onClick={handleRestart}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>
            )}

            {!currentNode.isEnd && currentNode.choices.length > 0 && (
              <div className="mt-8 space-y-3">
                <p className="text-slate-600">What do you do?</p>
                {currentNode.choices.map((choice) => (
                  <Button
                    key={choice.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4"
                    onClick={() => handleChoiceClick(choice.targetNodeId)}
                  >
                    {choice.text}
                  </Button>
                ))}
              </div>
            )}

            {!currentNode.isEnd && currentNode.choices.length === 0 && (
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm">
                  This scene has no choices defined. Please add choices in the editor.
                </p>
              </div>
            )}
          </Card>

          {history.length > 1 && (
            <div className="mt-4 text-center text-sm text-slate-500">
              Scene {history.length} of your journey
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
