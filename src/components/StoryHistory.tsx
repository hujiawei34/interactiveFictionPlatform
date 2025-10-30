import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { BookOpen, Trash2, Clock, FileText, Loader2 } from "lucide-react";

interface StoryMeta {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
}

interface StoryHistoryProps {
  stories: StoryMeta[];
  onLoad: (storyId: string) => void;
  onDelete: (storyId: string) => void;
  onClose: () => void;
  loading: boolean;
}

export function StoryHistory({
  stories,
  onLoad,
  onDelete,
  onClose,
  loading,
}: StoryHistoryProps) {
  const handleDelete = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this story?")) {
      onDelete(storyId);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Your Stories</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-slate-900 mb-2">No stories yet</h3>
            <p className="text-slate-600 text-sm">
              Create your first story and save it to see it here
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            {stories.map((story) => (
              <Card
                key={story.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onLoad(story.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      <h3 className="text-slate-900 truncate">{story.title}</h3>
                    </div>

                    {story.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                        {story.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{story.nodeCount} scenes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Updated {new Date(story.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(e, story.id)}
                    className="flex-shrink-0 ml-2"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
