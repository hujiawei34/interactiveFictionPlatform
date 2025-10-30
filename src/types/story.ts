export interface Choice {
  id: string;
  text: string;
  targetNodeId: string;
}

export interface StoryNode {
  id: string;
  title: string;
  content: string;
  choices: Choice[];
  position: { x: number; y: number };
  isStart?: boolean;
  isEnd?: boolean;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  nodes: StoryNode[];
  createdAt: string;
  updatedAt: string;
}
