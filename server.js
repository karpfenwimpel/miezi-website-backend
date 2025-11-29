import cors from "cors";
app.use(cors());


import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const upload = multer();
const app = express();

// Statische Dateien (Frontend)
app.use(express.static("public"));

// OpenAI Client
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Endpoint für Bildanalyse
app.post("/api/analyse-image", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Kein Bild hochgeladen!" });

  const base64 = req.file.buffer.toString("base64");

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Bitte beschreibe dieses Bild ein kleines bisschen und versuche dann die Katzenrasse selbstsicherer zu erkennen. Am besten maximal 100 wörter:"
            },
            {
              type: "input_image",
              image_url: `data:${req.file.mimetype};base64,${base64}`
            }
          ]
        }
      ]
    });

    res.json({ reply: response.output_text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler bei der KI" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server läuft auf Port " + PORT));
