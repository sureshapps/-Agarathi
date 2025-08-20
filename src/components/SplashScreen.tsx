import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 300);
    const timer2 = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 500); // match fade-out duration
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 500); // smooth fade duration
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "animate-fade-out" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-primary" />

      <div className="relative z-10 text-center space-y-8">
        <div className={`${showContent ? "animate-fade-in" : "opacity-0"}`}>
          <div className="relative">
            <div className="glass-card p-8 rounded-3xl">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <BookOpen className="w-16 h-16 text-primary-foreground animate-float" />
                  <Sparkles className="w-6 h-6 text-accent absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>

              <h1 className="text-3xl font-bold gradient-text mb-4">
                தமிழ் அகராதி

              </h1>

              <p className="text-primary-foreground/80 text-lg font-medium">
தமிழ் சொற்களின் அர்த்தத்தை அறிந்து கொள்ளுங்கள்
              </p>
            </div>
          </div>
        </div>

        <div
          className={`${
            showContent ? "animate-slide-up" : "opacity-0"
          } delay-300`}
        >
          <Button
            variant="glass"
            size="lg"
            onClick={handleClose}
            className="font-semibold"
          >
            Begin Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
