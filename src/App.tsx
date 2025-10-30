import { useState, useEffect } from "react";
import { Story, StoryNode } from "./types/story";
import { StoryEditor } from "./components/StoryEditor";
import { StoryPreview } from "./components/StoryPreview";
import { StoryMetadata } from "./components/StoryMetadata";
import { AuthPage } from "./components/AuthPage";
import { StoryHistory } from "./components/StoryHistory";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { BookOpen, Settings, Download, Upload, History, LogOut, Save, Loader2 } from "lucide-react";
import { createClient } from "./utils/supabase/client";
import { projectId, publicAnonKey } from "./utils/supabase/info";

interface User {
  id: string;
  email: string;
  name: string;
}

interface StoryMeta {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [story, setStory] = useState<Story>({
    id: `story-${Date.now()}`,
    title: "Untitled Story",
    description: "",
    nodes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [mode, setMode] = useState<"editor" | "preview">("editor");
  const [showMetadata, setShowMetadata] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [storyHistory, setStoryHistory] = useState<StoryMeta[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const supabase = createClient();

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session) {
        setAccessToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || "User",
        });
      }
    } catch (error) {
      console.error("Session check error:", error);
    } finally {
      setCheckingSession(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setAccessToken(data.session.access_token);
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name: data.user.user_metadata?.name || "User",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthError(error.message || "Failed to login");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c931b1bb/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      // Auto-login after signup
      await handleLogin(email, password);
    } catch (error: any) {
      console.error("Signup error:", error);
      setAuthError(error.message || "Failed to create account");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
    setStory({
      id: `story-${Date.now()}`,
      title: "Untitled Story",
      description: "",
      nodes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveStory = async () => {
    if (!accessToken) return;

    setSaveLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c931b1bb/stories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(story),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save story");
      }

      alert("Story saved successfully!");
    } catch (error: any) {
      console.error("Save story error:", error);
      alert(error.message || "Failed to save story");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLoadHistory = async () => {
    if (!accessToken) return;

    setShowHistory(true);
    setHistoryLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c931b1bb/stories`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load stories");
      }

      setStoryHistory(data.stories);
    } catch (error: any) {
      console.error("Load history error:", error);
      alert(error.message || "Failed to load story history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLoadStory = async (storyId: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c931b1bb/stories/${storyId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load story");
      }

      setStory(data.story);
      setShowHistory(false);
      setMode("editor");
    } catch (error: any) {
      console.error("Load story error:", error);
      alert(error.message || "Failed to load story");
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c931b1bb/stories/${storyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete story");
      }

      // Refresh history
      setStoryHistory(storyHistory.filter((s) => s.id !== storyId));
    } catch (error: any) {
      console.error("Delete story error:", error);
      alert(error.message || "Failed to delete story");
    }
  };

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

  const handleNewStory = () => {
    if (story.nodes.length > 0) {
      if (!confirm("Create a new story? Any unsaved changes will be lost.")) {
        return;
      }
    }
    setStory({
      id: `story-${Date.now()}`,
      title: "Untitled Story",
      description: "",
      nodes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setMode("editor");
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

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onSignup={handleSignup}
        error={authError}
        loading={authLoading}
      />
    );
  }

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
            <span className="text-sm text-slate-600 mr-2">
              Hello, {user.name}
            </span>
            
            <Button variant="outline" size="sm" onClick={handleNewStory}>
              New Story
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveStory}
              disabled={saveLoading}
            >
              {saveLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={handleLoadHistory}>
              <History className="w-4 h-4 mr-2" />
              History
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMetadata(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Details
            </Button>

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
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

      {/* Story History Dialog */}
      {showHistory && (
        <StoryHistory
          stories={storyHistory}
          onLoad={handleLoadStory}
          onDelete={handleDeleteStory}
          onClose={() => setShowHistory(false)}
          loading={historyLoading}
        />
      )}
    </div>
  );
}

export default App;
