import { Story } from "../types/story";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

interface StoryMetadataProps {
  story: Story;
  onSave: (story: Story) => void;
  onClose: () => void;
}

export function StoryMetadata({ story, onSave, onClose }: StoryMetadataProps) {
  const [title, setTitle] = useState(story.title);
  const [description, setDescription] = useState(story.description);

  const handleSave = () => {
    onSave({
      ...story,
      title,
      description,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Story Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="story-title">Story Title</Label>
            <Input
              id="story-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your story title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story-description">Description</Label>
            <Textarea
              id="story-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your story..."
              rows={4}
            />
          </div>

          <div className="text-sm text-slate-500">
            <p>Created: {new Date(story.createdAt).toLocaleDateString()}</p>
            <p>Last updated: {new Date(story.updatedAt).toLocaleDateString()}</p>
            <p>Scenes: {story.nodes.length}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
