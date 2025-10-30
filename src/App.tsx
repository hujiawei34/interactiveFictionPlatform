import { useState } from "react";
import { Story, StoryNode } from "./types/story";
import { StoryEditor } from "./components/StoryEditor";
import { StoryPreview } from "./components/StoryPreview";
import { StoryMetadata } from "./components/StoryMetadata";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { BookOpen, Settings, Download, Upload } from "lucide-react";

function App() {
  const [story, setStory] = useState<Story>({
    id: "story-1",
    title: "Untitled Story",
    description: "",
    nodes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [mode, setMode] = useState<"editor" | "preview">("editor");
  const [showMetadata, setShowMetadata] = useState(false);

  const handleNodesChange = (nodes: StoryNode[]) => {
    setStory({
      ...story,
      nodes,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleStoryUpdate = (updatedStory: Story) => {
    setStory(updatedStory);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(story, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `${story.title.replace(/\s+/g, "_")}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedStory = JSON.parse(event.target?.result as string);
            setStory(importedStory);
          } catch (error) {
            alert("Failed to import story. Please check the file format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-slate-900" />
            <div>
              <h1 className="text-slate-900">Interactive Fiction Studio</h1>
              <p className="text-sm text-slate-600">{story.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMetadata(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Story Details
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {mode === "editor" ? (
          story.nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full bg-slate-50">
              <Card className="p-8 max-w-md text-center">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h2 className="text-slate-900 mb-2">Start Your Story</h2>
                <p className="text-slate-600 mb-6">
                  Create your first scene to begin building your interactive fiction.
                  Add scenes, create choices, and connect them to form branching narratives.
                </p>
                <Button
                  onClick={() => {
                    const firstNode: StoryNode = {
                      id: `node-${Date.now()}`,
                      title: "Opening Scene",
                      content: "Your story begins here...",
                      choices: [],
                      position: { x: 400, y: 200 },
                      isStart: true,
                      isEnd: false,
                    };
                    handleNodesChange([firstNode]);
                  }}
                >
                  Create First Scene
                </Button>
              </Card>
            </div>
          ) : (
            <StoryEditor
              nodes={story.nodes}
              onNodesChange={handleNodesChange}
              onPreview={() => setMode("preview")}
            />
          )
        ) : (
          <StoryPreview
            nodes={story.nodes}
            onBack={() => setMode("editor")}
          />
        )}
      </main>

      {/* Story Metadata Dialog */}
      {showMetadata && (
        <StoryMetadata
          story={story}
          onSave={handleStoryUpdate}
          onClose={() => setShowMetadata(false)}
        />
      )}
    </div>
  );
}

export default App;
