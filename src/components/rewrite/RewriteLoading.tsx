import { useState, useEffect } from 'react';

const messages = [
  "Analyzing your listing...",
  "Scoring conversion potential...",
  "Writing emotional variant...",
  "Writing analytical variant...",
  "Writing impulse variant...",
  "Calculating improvement scores...",
];

export function RewriteLoading() {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 95));
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-6" />

      <div className="h-6 mb-6">
        <p key={currentMessage} className="text-sm text-foreground fade-in">
          {messages[currentMessage]}
        </p>
      </div>

      <div className="w-full max-w-xs">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground font-mono mt-2">{progress}%</p>
      </div>
    </div>
  );
}
