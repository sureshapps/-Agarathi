"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, BookOpen } from "lucide-react"; // ✅ Added BookOpen
import { toast } from "@/components/ui/use-toast";

// WordData interface
interface WordData {
  word: string;
  phonetics: string[];
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string }[];
  }[];
}

export default function TamilDictionaryApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // 🔥 Auto Image Generator (placeholder)
  const generateWordImageAuto = (wordData: WordData) => {
    const definition =
      wordData.meanings[0]?.definitions[0]?.definition || "விளக்கம் இல்லை";
    const fakeImageUrl = `https://dummyimage.com/600x400/000/fff.png&text=${encodeURIComponent(
      wordData.word + " - " + definition
    )}`;
    setGeneratedImage(fakeImageUrl);
  };

  // 🔎 Tamil Wiktionary Fetch + Parser
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

      // Extract structured meanings
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

      // 🔥 Generate word image
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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3">
          

  <img 
  src="https://iagarathi.netlify.app/-20-08-2025.png" 
  alt="தமிழ் அகராதி" 
  className="h-20 md:h-25"
/>
           <img 
  src="https://raw.githubusercontent.com/sureshapps/-Agarathi/refs/heads/main/public/description.png" 
  alt="description" 
  className="h-12 md:h-16"
/>
        </div>   
        </div>

        {/* Search Bar */}
        <div className="flex w-full max-w-md items-center space-x-2 mb-6">
          <Input
            type="text"
            placeholder="தமிழ்ச் சொற்களைத் தேடுங்கள்..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <Button
            onClick={searchWord}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Results */}
        {wordData && (
          <Card className="w-full max-w-md shadow-md">
            <CardContent className="p-4">
              <h2 className="text-2xl font-bold mb-3 text-red-400">
                {wordData.word}
              </h2>
            </CardContent>
            <CardContent className="p-4">
              {wordData.meanings.map((meaning, i) => (
                <div key={i} className="mb-4">
                  <p className="font-xl text-indigo-700">
                    {meaning.partOfSpeech}
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    {meaning.definitions.map((def, j) => (
                      <li key={j}>
                        {def.definition}
                        {def.example && (
                          <p className="text-sm text-gray-600 italic">
                            உதாரணம்: {def.example}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!wordData && !isLoading && (
          <Card className="glass-card p-12 text-center animate-fade-in">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Ready to explore?
            </h3>
            <p className="text-muted-foreground">
              Enter a word above to discover its meaning, pronunciation, and
              visual representation.
            </p>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="glass-card p-6 rounded-lg">
            <p className="text-muted-foreground text-sm">
              © 2024 WordNexus. Made with ❤️ using Dictionary API and Runware AI.
            </p>
            <p className="text-muted-foreground text-xs mt-2 opacity-75">
              Discover the beauty of language through words and visuals.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
