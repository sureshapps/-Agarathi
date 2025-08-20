import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Volume2, Loader2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RunwareService, type GeneratedImage } from "@/services/runware";

interface Phonetic {
  text: string;
  audio?: string;
}

interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

interface WordData {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  origin?: string;
  meanings: Meaning[];
}

const DictionaryApp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("NjZM2OqqDLrkxwbfgHz4CtYpCnYie1jD");

  const [runwareService, setRunwareService] = useState<RunwareService | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();

  const searchWord = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${searchTerm.toLowerCase()}`
      );

      if (!response.ok) {
        throw new Error("Word not found");
      }

      const data = await response.json();
      setWordData(data[0]);

      // Auto-generate image
      generateWordImageAuto(data[0]);
    } catch (error) {
      toast({
        title: "Word not found",
        description: "Please try a different word or check your spelling.",
        variant: "destructive",
      });
      setWordData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWordImageAuto = async (wordData: WordData) => {
    setIsGeneratingImage(true);

    try {
      let service = runwareService;
      if (!service) {
        service = new RunwareService(apiKey);
        setRunwareService(service);
      }

      const firstDefinition =
        wordData.meanings[0]?.definitions[0]?.definition || "";
      const prompt = `Beautiful artistic illustration of "${wordData.word}", ${firstDefinition}, high quality, detailed, vibrant colors, artistic style`;

      const image = await service.generateImage({
        positivePrompt: prompt,
        numberResults: 1,
        outputFormat: "WEBP",
      });

      setGeneratedImage(image);
    } catch (error) {
      console.error("Image generation error:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(
        audioUrl.startsWith("//") ? `https:${audioUrl}` : audioUrl
      );
      audio.play().catch(() => {
        toast({
          title: "Audio unavailable",
          description: "Could not play pronunciation audio.",
        });
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchWord();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-primary drop-shadow-md" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight gradient-text drop-shadow-lg">
              WordNexus
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Explore the depths of language with visual representations
          </p>
        </div>

        {/* Search Section */}
        <Card className="glass-card p-6 animate-slide-up">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Enter a word to explore..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-white/10 border-white/20 backdrop-blur-md text-foreground placeholder:text-white/60 focus-visible:ring-primary text-lg h-12 pr-12"
                disabled={isLoading}
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
            <Button
              onClick={searchWord}
              disabled={isLoading || !searchTerm.trim()}
              variant="glass"
              size="lg"
              className="px-8"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {wordData && (
          <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Image Column - first on mobile */}
            <div className="space-y-6 order-1 lg:order-2">
              {generatedImage && (
                <Card className="glass-card p-6 space-y-4">
                  <h3 className="text-xl font-semibold gradient-text">
                    Visual Representation
                  </h3>
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={generatedImage.imageURL}
                      alt={`Visual representation of ${wordData.word}`}
                      className="w-full h-auto rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI-generated illustration for "{wordData.word}"
                  </p>
                </Card>
              )}

              {!generatedImage && wordData && isGeneratingImage && (
                <Card className="glass-card p-12 text-center">
                  <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                    Generating Image...
                  </h3>
                  <p className="text-muted-foreground">
                    Creating a visual representation for "{wordData.word}"
                  </p>
                </Card>
              )}
            </div>

            {/* Word Info Column */}
            <div className="space-y-6 order-2 lg:order-1">
              <Card className="glass-card p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold gradient-text capitalize">
                        {wordData.word}
                      </h2>
                      {wordData.phonetic && (
                        <p className="text-muted-foreground text-lg mt-1">
                          {wordData.phonetic}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {wordData.phonetics.find((p) => p.audio) && (
                        <Button
                          onClick={() => {
                            const audioPhonetic = wordData.phonetics.find(
                              (p) => p.audio
                            );
                            if (audioPhonetic?.audio) playAudio(audioPhonetic.audio);
                          }}
                          variant="glass"
                          size="sm"
                          className="gap-2"
                        >
                          <Volume2 className="w-4 h-4" />
                          Play
                        </Button>
                      )}
                    </div>
                  </div>

                  {wordData.origin && (
                    <div className="p-4 glass-card rounded-lg">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
                        Origin
                      </h4>
                      <p className="text-card-foreground">{wordData.origin}</p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="space-y-4">
                {wordData.meanings.map((meaning, index) => (
                  <Card key={index} className="glass-card p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-primary capitalize">
                      {meaning.partOfSpeech}
                    </h3>
                    <div className="space-y-3">
                      {meaning.definitions.map((def, defIndex) => (
                        <div key={defIndex} className="space-y-2">
                          <p className="text-card-foreground leading-relaxed">
                            <span className="font-medium">{defIndex + 1}.</span>{" "}
                            {def.definition}
                          </p>

                          {def.example && (
                            <p className="text-muted-foreground italic pl-6 border-l-2 border-primary/30">
                              "{def.example}"
                            </p>
                          )}

                          {def.synonyms && def.synonyms.length > 0 && (
                            <div className="pl-6">
                              <span className="text-sm font-medium text-secondary">
                                Synonyms:{" "}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {def.synonyms.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
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
};

export default DictionaryApp;
