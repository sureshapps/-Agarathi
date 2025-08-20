import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Loader2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TamilDictionaryApp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [definition, setDefinition] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchWord = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setDefinition(null);

    try {
      // Tamil Wiktionary API call
      const response = await fetch(
        `https://ta.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(
          searchTerm
        )}&prop=extracts&format=json&origin=*`
      );

      if (!response.ok) throw new Error("Word not found");

      const data = await response.json();
      const pages = data.query?.pages || {};
      const firstPage = Object.values(pages)[0] as any;

      if (firstPage?.extract) {
        // Extract raw HTML text from Wiktionary
        setDefinition(firstPage.extract);
      } else {
        throw new Error("No definition found");
      }
    } catch (error) {
      toast({
        title: "சொல் கிடைக்கவில்லை",
        description: "வேறு சொல் முயற்சி செய்யவும்.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") searchWord();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-pink-50 to-yellow-50">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-pink-600" />
            <h1 className="text-4xl font-extrabold tracking-tight text-pink-700">
              தமிழ் அகராதி
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            தமிழ் சொற்களின் அர்த்தத்தை அறிந்து கொள்ளுங்கள்
          </p>
        </div>

        {/* Search Box */}
        <Card className="p-6 shadow-md">
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="சொல் எழுதவும்..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-lg h-12"
              disabled={isLoading}
            />
            <Button
              onClick={searchWord}
              disabled={isLoading || !searchTerm.trim()}
              className="px-6 bg-pink-600 hover:bg-pink-700"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </Button>
          </div>
        </Card>

        {/* Result */}
        {definition && (
          <Card className="p-6 shadow-md prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: definition }} />
          </Card>
        )}

        {/* Empty State */}
        {!definition && !isLoading && (
          <Card className="p-12 text-center text-gray-500">
            <p>தமிழ் சொற்களின் அர்த்தம் காண தேடுங்கள்.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TamilDictionaryApp;
