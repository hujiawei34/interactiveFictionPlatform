import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", cors());
app.use("*", logger(console.log));

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Health check
app.get("/make-server-c931b1bb/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-c931b1bb/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Signup exception: ${error}`);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// Save story endpoint
app.post("/make-server-c931b1bb/stories", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized - no token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.log(`Auth error in save story: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const story = await c.req.json();
    
    // Store story with user ID as key prefix
    const storyKey = `story:${user.id}:${story.id}`;
    await kv.set(storyKey, story);

    // Update user's story list
    const storyListKey = `story-list:${user.id}`;
    const storyList = await kv.get(storyListKey) || [];
    
    // Add or update story in list
    const existingIndex = storyList.findIndex((s: any) => s.id === story.id);
    const storyMeta = {
      id: story.id,
      title: story.title,
      description: story.description,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      nodeCount: story.nodes.length,
    };

    if (existingIndex >= 0) {
      storyList[existingIndex] = storyMeta;
    } else {
      storyList.push(storyMeta);
    }

    await kv.set(storyListKey, storyList);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Save story exception: ${error}`);
    return c.json({ error: "Internal server error while saving story" }, 500);
  }
});

// Get all stories for a user
app.get("/make-server-c931b1bb/stories", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized - no token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.log(`Auth error in get stories: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const storyListKey = `story-list:${user.id}`;
    const storyList = await kv.get(storyListKey) || [];

    return c.json({ stories: storyList });
  } catch (error) {
    console.log(`Get stories exception: ${error}`);
    return c.json({ error: "Internal server error while fetching stories" }, 500);
  }
});

// Get a specific story
app.get("/make-server-c931b1bb/stories/:id", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized - no token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.log(`Auth error in get story: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const storyId = c.req.param("id");
    const storyKey = `story:${user.id}:${storyId}`;
    const story = await kv.get(storyKey);

    if (!story) {
      return c.json({ error: "Story not found" }, 404);
    }

    return c.json({ story });
  } catch (error) {
    console.log(`Get story exception: ${error}`);
    return c.json({ error: "Internal server error while fetching story" }, 500);
  }
});

// Delete a story
app.delete("/make-server-c931b1bb/stories/:id", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized - no token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.log(`Auth error in delete story: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const storyId = c.req.param("id");
    
    // Delete story
    const storyKey = `story:${user.id}:${storyId}`;
    await kv.del(storyKey);

    // Update story list
    const storyListKey = `story-list:${user.id}`;
    const storyList = await kv.get(storyListKey) || [];
    const updatedList = storyList.filter((s: any) => s.id !== storyId);
    await kv.set(storyListKey, updatedList);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete story exception: ${error}`);
    return c.json({ error: "Internal server error while deleting story" }, 500);
  }
});

Deno.serve(app.fetch);
