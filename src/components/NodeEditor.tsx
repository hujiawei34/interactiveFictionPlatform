import { useState } from "react";
import { StoryNode, Choice } from "../types/story";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Trash2, Plus, X } from "lucide-react";
import { Switch } from "./ui/switch";

interface NodeEditorProps {
  node: StoryNode;
  allNodes: StoryNode[];
  onSave: (node: StoryNode) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

export function NodeEditor({ node, allNodes, onSave, onDelete, onClose }: NodeEditorProps) {
  const [title, setTitle] = useState(node.title);
  const [content, setContent] = useState(node.content);
  const [choices, setChoices] = useState<Choice[]>(node.choices);
  const [isStart, setIsStart] = useState(node.isStart || false);
  const [isEnd, setIsEnd] = useState(node.isEnd || false);

  const handleAddChoice = () => {
    const newChoice: Choice = {
      id: `choice-${Date.now()}`,
      text: "New choice",
      targetNodeId: "",
    };
    setChoices([...choices, newChoice]);
  };

  const handleRemoveChoice = (choiceId: string) => {
    setChoices(choices.filter((c) => c.id !== choiceId));
  };

  const handleChoiceTextChange = (choiceId: string, text: string) => {
    setChoices(
      choices.map((c) => (c.id === choiceId ? { ...c, text } : c))
    );
  };

  const handleChoiceTargetChange = (choiceId: string, targetNodeId: string) => {
    setChoices(
      choices.map((c) => (c.id === choiceId ? { ...c, targetNodeId } : c))
    );
  };

  const handleSave = () => {
    onSave({
      ...node,
      title,
      content,
      choices: isEnd ? [] : choices,
      isStart,
      isEnd,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this scene?")) {
      onDelete(node.id);
    }
  };

  const availableTargets = allNodes.filter((n) => n.id !== node.id);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Scene</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Scene Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter scene title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Scene Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the story text for this scene..."
              rows={6}
            />
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="is-start"
                checked={isStart}
                onCheckedChange={setIsStart}
              />
              <Label htmlFor="is-start">Starting Scene</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is-end"
                checked={isEnd}
                onCheckedChange={setIsEnd}
              />
              <Label htmlFor="is-end">Ending Scene</Label>
            </div>
          </div>

          {!isEnd && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Choices</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddChoice}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Choice
                </Button>
              </div>

              {choices.length === 0 && (
                <p className="text-sm text-slate-500">
                  No choices added yet. Add choices to create branching paths.
                </p>
              )}

              {choices.map((choice, index) => (
                <div
                  key={choice.id}
                  className="flex gap-2 items-start p-3 border rounded-lg bg-slate-50"
                >
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Choice text (e.g., 'Open the door')"
                      value={choice.text}
                      onChange={(e) =>
                        handleChoiceTextChange(choice.id, e.target.value)
                      }
                    />
                    <Select
                      value={choice.targetNodeId}
                      onValueChange={(value) =>
                        handleChoiceTargetChange(choice.id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target scene" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTargets.map((targetNode) => (
                          <SelectItem key={targetNode.id} value={targetNode.id}>
                            {targetNode.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveChoice(choice.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Scene
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
