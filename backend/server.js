import express from "express";
import cors from "cors";
import { generate } from "./chatbot.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

app.post("/chat", async (req, res) => {
  const { message, threadId } = req.body;

  if (!message || !threadId)
    return res.status(400).json({ message: "All fields are required" });

  const result = await generate(message, threadId);
  res.json({ message: result });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
