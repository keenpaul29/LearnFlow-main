'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

export function StudyTimer() {
  const [selectedDuration, setSelectedDuration] = useState(25); // Default to 25 minutes
  const [timeLeft, setTimeLeft] = useState(selectedDuration * 60); // Initialize with the selected duration in seconds
  const [isRunning, setIsRunning] = useState(false);

  // Initialize timeLeft with selectedDuration when component mounts
  useEffect(() => {
    setTimeLeft(selectedDuration * 60);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            toast({
              title: "Study Session Complete!",
              description: "Great job! Take a short break before continuing.",
            });
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, selectedDuration]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleDurationChange = (value: number[]) => {
    const duration = value[0];
    setSelectedDuration(duration);
    setTimeLeft(duration * 60);
    // Reset the timer state when duration changes
    setIsRunning(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Study Timer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <div className="text-6xl font-bold text-primary">
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant={isRunning ? "destructive" : "default"}
                size="icon"
                onClick={toggleTimer}
              >
                {isRunning ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={resetTimer}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-full space-y-2">
              <label className="text-sm text-muted-foreground">
                Session Duration: {selectedDuration} minutes
              </label>
              <Slider
                value={[selectedDuration]}
                max={60}
                min={5}
                step={5}
                onValueChange={handleDurationChange}
                disabled={isRunning}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
