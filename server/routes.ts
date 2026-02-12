import { Router } from "express";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { putObject, getObject, deleteObject } from "./s3.js";
import { config } from "./config.js";

const router = Router();

router.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const EXAMPLES_DIR = path.resolve("examples/plans");

router.get("/api/config", (_req, res) => {
  res.json({
    siteTitle: config.frontend.siteTitle,
    customBanner: config.frontend.customBanner,
    showExamples: config.examples.enabled,
  });
});

router.get("/api/examples", (_req, res) => {
  if (!config.examples.enabled) {
    res.status(403).json({ error: "Examples are not enabled" });
    return;
  }
  try {
    if (!fs.existsSync(EXAMPLES_DIR)) {
      res.json([]);
      return;
    }
    const files = fs.readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith(".json")).sort();
    const examples = files.map((f) => {
      const raw = fs.readFileSync(path.join(EXAMPLES_DIR, f), "utf-8");
      const doc = JSON.parse(raw);
      return { name: f.replace(/\.json$/, ""), title: doc.title };
    });
    res.json(examples);
  } catch (err) {
    console.error("GET /api/examples error:", err);
    res.json([]);
  }
});

router.get("/api/examples/:name", (req, res) => {
  if (!config.examples.enabled) {
    res.status(404).json({ error: "Examples are not enabled" });
    return;
  }
  const name = req.params.name;
  if (!/^[\w-]+$/.test(name)) {
    res.status(400).json({ error: "Invalid example name" });
    return;
  }
  const filePath = path.join(EXAMPLES_DIR, `${name}.json`);
  try {
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "Example not found" });
      return;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error("GET /api/examples/:name error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/plans", async (req, res) => {
  try {
    const { title, plan, query } = req.body;

    if (!plan || typeof plan !== "string") {
      res.status(400).json({ error: "plan is required" });
      return;
    }

    const id = crypto.randomUUID();
    const deleteKey = crypto.randomBytes(25).toString("hex");

    const doc = {
      id,
      title: title || "",
      plan,
      query: query || "",
      createdAt: new Date().toISOString(),
      deleteKey,
    };

    await putObject(`plans/${id}.json`, JSON.stringify(doc));

    res.status(201).json({ id, deleteKey });
  } catch (err) {
    console.error("POST /api/plans error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/plans/:id", async (req, res) => {
  try {
    const raw = await getObject(`plans/${req.params.id}.json`);
    if (!raw) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    const doc = JSON.parse(raw);
    const { deleteKey, ...publicDoc } = doc;

    res.json(publicDoc);
  } catch (err) {
    console.error("GET /api/plans/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/api/plans/:id", async (req, res) => {
  try {
    const deleteKey = req.headers["x-delete-key"];
    if (!deleteKey || typeof deleteKey !== "string") {
      res.status(401).json({ error: "x-delete-key header required" });
      return;
    }

    const raw = await getObject(`plans/${req.params.id}.json`);
    if (!raw) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    const doc = JSON.parse(raw);
    if (doc.deleteKey !== deleteKey) {
      res.status(403).json({ error: "Invalid delete key" });
      return;
    }

    await deleteObject(`plans/${req.params.id}.json`);
    res.status(204).end();
  } catch (err) {
    console.error("DELETE /api/plans/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
