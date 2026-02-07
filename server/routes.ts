import { Router } from "express";
import crypto from "node:crypto";
import { putObject, getObject, deleteObject } from "./s3.js";
import { config } from "./config.js";

const router = Router();

router.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/api/config", (_req, res) => {
  res.json({
    siteTitle: config.frontend.siteTitle,
  });
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
