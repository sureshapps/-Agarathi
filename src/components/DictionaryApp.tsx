"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Runway from "@runwayml/sdk";
import { toast } from "@/components/ui/use-toast";

interface WordData {
  word: string;
  phonetics: string[];
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string }[];
  }[];
}

const runway = new Runway({
  apiKey: process.env.NEXT_PUBLIC_RUNWAY_API_KEY!, // stored in .env.local
});

export default function TamilDictionaryApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // 🔍 Search Tamil word from Wiktionary
  const searchWord = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const response = await fetch(
        `https://ta.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(
          searchTerm
        )}&prop=extracts&format=json&origin=*`
      );

      if (!response.ok) throw new Error("Word not found");
      const data = await response.json();
      const pages = data.query.pages;
      const page = Object.values(pages)[0] as any;

      if (!page.extract) throw new Error("No definition available");

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(page.extract, "text/html");

      // Extract structured info
      const meanings: WordData["meanings"] = [];
      let currentPart = "விளக்கம்";

      doc.querySelectorAll("h3, h4, li").forEach((el) => {
        if (el.tagName === "H3" || el.tagName === "H4") {
          currentPart = el.textContent?.trim() || currentPart;
        }
        if (el.tagName === "LI") {
          const text = el.textContent?.trim();
          if (text) {
            const match = text.match(/^(.*?)(“.*”|‘.*’)?$/);
            const definition = match?.[1]?.trim() || text;
            const example = match?.[2]?.replace(/[“”‘’]/g, "").trim();

            let part = meanings.find((m) => m.partOfSpeech === currentPart);
            if (!part) {
              part = { partOfSpeech: currentPart, definitions: [] };
              meanings.push(part);
            }
            part.definitions.push({ definition, example });
          }
        }
      });

      const tamilWordData: WordData = {
        word: searchTerm,
        phonetics: [],
        meanings,
      };

      setWordData(tamilWordData);

      // 🔥 Auto-generate Tamil flashcard with RunwayML
      generateWordImageAuto(tamilWordData);
    } catch (error) {
      toast({
        title: "சொல் கிடைக்கவில்லை",
        description: "வேறு சொல் முயற்சி செய்யவும்.",
        variant: "destructive",
      });
      setWordData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 🎨 RunwayML image generator
  const generateWordImageAuto = async (wordData: WordData) => {
    try {
      const definition =
        wordData.meanings[0]?.definitions[0]?.definition || "விளக்கம் இல்லை";

      const prompt = `Create a Tamil flashcard illustration.
      Word: "${wordData.word}"
      Meaning: ${definition}
      Style: clean, educational, visually clear with the Tamil word text shown.`;

      const result = await runway.images.generate({
        model: "stable-diffusion-v1-5", // you can try "gen-2" too
        prompt,
        width: 512,
        height: 512,
      });

      setGeneratedImage(result.data[0].url || null);
    } catch (err) {
      console.error("RunwayML image generation failed:", err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
        தமிழ் அகராதி
      </h1>

      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="சொல் தேடுங்கள்..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button onClick={searchWord} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : "தேடுக"}
        </Button>
      </div>

      {wordData && (
        <Card className="p-4 mb-4">
          <h2 className="text-2xl font-bold text-purple-700 mb-2">
            {wordData.word}
          </h2>
          {wordData.meanings.map((meaning, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="text-lg font-semibold text-gray-600">
                {meaning.partOfSpeech}
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {meaning.definitions.map((def, i) => (
                  <li key={i}>
                    {def.definition}
                    {def.example && (
                      <span className="text-gray-500"> – {def.example}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Card>
      )}

      {generatedImage && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">உருவாக்கப்பட்ட படி:</h3>
          <img
            src={generatedImage}
            alt="Tamil Flashcard"
            className="w-full rounded-lg shadow"
          />
        </div>
      )}
    </div>
  );
}
