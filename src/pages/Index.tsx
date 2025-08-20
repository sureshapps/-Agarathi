import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import DictionaryApp from "@/components/DictionaryApp";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <DictionaryApp />
      )}
    </>
  );
};

export default Index;