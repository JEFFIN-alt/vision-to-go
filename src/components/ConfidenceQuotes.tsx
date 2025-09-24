import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const confidenceQuotes = [
  "Your beauty shines from within! ✨",
  "Every day is a chance to reinvent yourself! 💫",
  "Confidence is your best accessory! 👑",
  "You are absolutely stunning just as you are! 🌟",
  "Your unique style is your superpower! 💪",
  "Beauty begins the moment you decide to be yourself! 🦋",
  "You're not just changing your look, you're unleashing your potential! 🚀",
  "Your glow up journey starts with self-love! 💖",
  "Every transformation tells your beautiful story! 📖",
  "You have the power to create the look you love! ⚡",
  "Your style evolution is a work of art! 🎨",
  "Embrace change, it looks beautiful on you! 🌸",
  "Your confidence is magnetic! 🧲",
  "You're writing your own beauty rules! ✍️",
  "Your transformation journey is inspiring! 🌈",
];

const morningGreetings = [
  "Good morning, beautiful! Ready to transform today?",
  "Rise and shine! Your glow-up awaits!",
  "Hello gorgeous! What amazing look will you try today?",
  "Good morning! Your confidence is already glowing!",
  "Wake up and be amazing! Your style journey continues!",
];

const afternoonGreetings = [
  "Good afternoon! Time for a style refresh?",
  "Hey stunning! Ready to try something new?",
  "Afternoon beauty! Your next transformation awaits!",
  "Hello! Your midday glow-up moment is here!",
];

const eveningGreetings = [
  "Good evening! Perfect time for a style experiment!",
  "Evening, gorgeous! Ready for a dramatic transformation?",
  "Hello beautiful! Night looks are calling your name!",
  "Good evening! Your after-dark style awaits!",
];

interface ConfidenceQuotesProps {
  className?: string;
}

const ConfidenceQuotes: React.FC<ConfidenceQuotesProps> = ({ className = "" }) => {
  const [currentQuote, setCurrentQuote] = useState('');
  const [greeting, setGreeting] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const getRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * confidenceQuotes.length);
      return confidenceQuotes[randomIndex];
    };

    const getTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      let greetings;
      
      if (hour < 12) {
        greetings = morningGreetings;
      } else if (hour < 17) {
        greetings = afternoonGreetings;
      } else {
        greetings = eveningGreetings;
      }
      
      const randomIndex = Math.floor(Math.random() * greetings.length);
      return greetings[randomIndex];
    };

    const userName = user?.email?.split('@')[0] || 'Beautiful';
    const timeGreeting = getTimeBasedGreeting();
    const personalizedGreeting = timeGreeting.replace(/^(Good morning|Good afternoon|Good evening|Hello|Hey|Hi|Wake up|Rise|Afternoon)/, 
      `$1, ${userName.charAt(0).toUpperCase() + userName.slice(1)}`);

    setGreeting(personalizedGreeting);
    setCurrentQuote(getRandomQuote());

    // Rotate quotes every 10 seconds
    const interval = setInterval(() => {
      setCurrentQuote(getRandomQuote());
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className={`bg-gradient-hero text-white p-6 rounded-xl shadow-glow ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        <h2 className="text-lg font-semibold">Daily Motivation</h2>
      </div>
      
      <div className="space-y-2">
        <p className="text-base font-medium leading-relaxed">
          {greeting}
        </p>
        <p className="text-sm opacity-90 leading-relaxed transition-all duration-500 ease-in-out">
          {currentQuote}
        </p>
      </div>
    </div>
  );
};

export default ConfidenceQuotes;