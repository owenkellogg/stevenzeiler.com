'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/utils/i18n/LanguageProvider';
import { dictionaries } from '@/utils/i18n/dictionaries';

// Define the posture instructions
const postureInstructions: Record<string, { instructions: string[] }> = {
  '1-pranayama': {
    instructions: [
      "Stand with your feet together, heels and toes touching.",
      "Interlock your fingers and place them under your chin.",
      "Inhale through your nose as you raise your elbows up to shoulder height.",
      "Hold your breath and tilt your head back.",
      "Exhale through your mouth as you lower your elbows and head back to the starting position.",
      "Repeat for the duration of the posture."
    ]
  },
  '2-half-moon': {
    instructions: [
      "Stand with your feet together, arms over your head with palms together.",
      "Stretch up and then bend to the right, pushing your hips to the left.",
      "Keep your arms straight and aligned with your ears.",
      "Hold for 20 seconds, then return to center.",
      "Repeat on the left side.",
      "For the second part, bend forward from the waist with a straight back.",
      "Grab your heels or ankles and pull your body down toward your legs.",
      "Touch your forehead to your knees if possible."
    ]
  },
  '3-awkward': {
    instructions: [
      "Stand with your feet hip-width apart, toes forward.",
      "Raise your arms parallel to the floor, palms down.",
      "Sit down as if in an invisible chair, thighs parallel to the floor.",
      "Keep your spine straight and chest lifted.",
      "Hold for 20 seconds.",
      "For the second part, rise onto your toes and lower your body further.",
      "For the third part, sit even lower with your hips below your knees."
    ]
  },
  '4-eagle': {
    instructions: [
      "Stand with your feet together.",
      "Bend your knees slightly, lift your right leg and cross it over your left thigh.",
      "If possible, wrap your right foot behind your left calf.",
      "Cross your left arm over your right at the elbows, then wrap your forearms and bring palms together.",
      "Sink your hips lower while keeping your spine straight.",
      "Hold for 20 seconds, then repeat on the other side."
    ]
  },
  '5-standing-head-to-knee': {
    instructions: [
      "Stand with your feet together.",
      "Lift your right leg and hold your foot with both hands.",
      "Extend your right leg forward while keeping it straight.",
      "Bring your forehead toward your knee while keeping your standing leg straight.",
      "Hold for 20 seconds, then repeat on the other side."
    ]
  },
  '6-standing-bow': {
    instructions: [
      "Stand with your feet together.",
      "Shift your weight to your left foot.",
      "Bend your right knee and grab your right foot with your right hand from the inside.",
      "Extend your left arm forward and up.",
      "Kick your right foot up and back while leaning forward.",
      "Balance on your left leg, keeping it straight.",
      "Hold for 20 seconds, then repeat on the other side."
    ]
  },
  '7-balancing-stick': {
    instructions: [
      "Stand with your feet together, arms overhead with palms together.",
      "Step forward with your right foot.",
      "Lean forward, bringing your torso and left leg parallel to the floor.",
      "Keep your arms, torso, and raised leg in one straight line.",
      "Hold for 10 seconds, then repeat on the other side."
    ]
  },
  '8-standing-separate-leg-stretching': {
    instructions: [
      "Step your feet apart (about 4 feet).",
      "Bend forward from the hips with a flat back.",
      "Grab your heels or ankles from behind.",
      "Pull your torso down toward the floor, bringing your head toward the floor.",
      "Keep your legs straight and active.",
      "Hold for 20 seconds."
    ]
  },
  '9-triangle': {
    instructions: [
      "Step your feet apart (about 4 feet).",
      "Turn your right foot out 90 degrees and your left foot in slightly.",
      "Extend your arms out to the sides at shoulder height.",
      "Reach your right arm down toward your right ankle.",
      "Extend your left arm straight up toward the ceiling.",
      "Turn your head to look at your left hand.",
      "Hold for 20 seconds, then repeat on the other side."
    ]
  },
  '10-standing-separate-leg-head-to-knee': {
    instructions: [
      "Step your feet apart (about 4 feet).",
      "Turn your right foot out 90 degrees and your left foot in slightly.",
      "Bring your hands to prayer position at your chest.",
      "Extend your arms overhead, palms together.",
      "Bend to the right, bringing your torso toward your right leg.",
      "Bring your hands to the floor on either side of your right foot.",
      "Touch your forehead to your knee if possible.",
      "Hold for 20 seconds, then repeat on the other side."
    ]
  },
  '11-tree': {
    instructions: [
      "Stand with your feet together.",
      "Shift your weight to your right foot.",
      "Place your left foot on your right inner thigh, above or below the knee.",
      "Bring your hands to prayer position at your chest.",
      "Once stable, extend your arms overhead, palms together.",
      "Hold for 20 seconds, then repeat on the other side."
    ]
  },
  '12-toe-stand': {
    instructions: [
      "From Tree Pose, bend your standing leg and lower your body down.",
      "Balance on the ball of your right foot, keeping your left foot on your right thigh.",
      "Bring your hands to prayer position at your chest.",
      "Hold for 20 seconds, then repeat on the other side."
    ]
  },
  '13-corpse': {
    instructions: [
      "Lie on your back with your feet slightly apart.",
      "Place your arms at your sides, palms up.",
      "Close your eyes and relax your entire body.",
      "Breathe naturally and let go of any tension.",
      "Stay completely still."
    ]
  },
  '14-wind-removing': {
    instructions: [
      "Lie on your back.",
      "Bend your right knee and hug it to your chest.",
      "Interlace your fingers just below your knee.",
      "Pull your knee toward your shoulder while keeping your head and shoulders on the mat.",
      "Hold for 20 seconds, then repeat with the left leg.",
      "Finally, hug both knees to your chest."
    ]
  },
  '15-sit-up': {
    instructions: [
      "Lie on your back with your legs extended.",
      "Extend your arms overhead, biceps by your ears.",
      "Inhale deeply.",
      "As you exhale, lift your upper body and reach for your toes.",
      "Keep your legs straight and active.",
      "Return to the starting position and repeat."
    ]
  },
  '16-cobra': {
    instructions: [
      "Lie on your stomach with your legs together.",
      "Place your palms on the floor under your shoulders.",
      "Keep your elbows close to your body.",
      "Press into your hands and lift your chest off the floor.",
      "Keep your hips and legs on the floor.",
      "Look up toward the ceiling.",
      "Hold for 20 seconds."
    ]
  },
  '17-locust': {
    instructions: [
      "Lie on your stomach with your arms under your body, palms down.",
      "Keep your chin on the floor.",
      "Lift your right leg as high as possible without bending the knee.",
      "Hold for 10 seconds, then lower and repeat with the left leg.",
      "Finally, lift both legs simultaneously."
    ]
  },
  '18-full-locust': {
    instructions: [
      "Lie on your stomach with your arms extended alongside your body.",
      "Lift your arms, upper body, and legs off the floor simultaneously.",
      "Balance on your abdomen.",
      "Keep your legs straight and together.",
      "Hold for 10 seconds."
    ]
  },
  '19-bow': {
    instructions: [
      "Lie on your stomach.",
      "Bend your knees and grab your ankles from the outside.",
      "Kick your legs up and back while lifting your chest off the floor.",
      "Look forward and breathe normally.",
      "Hold for 20 seconds."
    ]
  },
  '20-fixed-firm': {
    instructions: [
      "Kneel on the floor with your knees and feet hip-width apart.",
      "Sit back between your heels.",
      "Slowly recline backward, first onto your elbows, then onto your back.",
      "Extend your arms overhead, touching the floor behind you.",
      "Keep your knees together and feet close to your hips.",
      "Hold for 20 seconds."
    ]
  },
  '21-half-tortoise': {
    instructions: [
      "Kneel on the floor with your knees and feet together.",
      "Sit back on your heels.",
      "Extend your arms overhead, palms together.",
      "Bend forward from the hips, bringing your forehead to the floor.",
      "Keep your buttocks on your heels.",
      "Extend your arms forward on the floor.",
      "Hold for 20 seconds."
    ]
  },
  '22-camel': {
    instructions: [
      "Kneel on the floor with your knees hip-width apart.",
      "Place your hands on your lower back, fingers pointing down.",
      "Lift your chest and arch your back.",
      "Reach for your heels with your hands.",
      "Let your head drop back.",
      "Push your hips forward.",
      "Hold for 20 seconds."
    ]
  },
  '23-rabbit': {
    instructions: [
      "Kneel on the floor with your knees and feet together.",
      "Sit back on your heels.",
      "Grab your heels from the outside.",
      "Tuck your chin to your chest and round your spine.",
      "Roll forward, bringing the top of your head to the floor.",
      "Lift your hips toward the ceiling.",
      "Keep a firm grip on your heels.",
      "Hold for 20 seconds."
    ]
  },
  '24-head-to-knee-and-stretching': {
    instructions: [
      "Sit with your legs extended in front of you.",
      "Bend your right knee and place your right foot against your left inner thigh.",
      "Grab your left foot with both hands.",
      "Bend forward, bringing your forehead toward your left knee.",
      "Keep your left leg straight and active.",
      "Hold for 20 seconds, then repeat on the other side.",
      "For the second part, extend both legs straight and grab your feet.",
      "Bend forward, bringing your forehead toward your knees."
    ]
  },
  '25-spine-twisting': {
    instructions: [
      "Sit with your legs extended in front of you.",
      "Bend your right knee and place your right foot on the outside of your left knee.",
      "Bend your left knee and bring your left heel toward your right hip.",
      "Place your right hand on the floor behind you.",
      "Bring your left elbow to the outside of your right knee.",
      "Twist your torso to the right and look over your right shoulder.",
      "Hold for 20 seconds, then repeat on the other side."
    ]
  },
  '26-blowing-in-firm': {
    instructions: [
      "Sit in a kneeling position with your knees and feet together.",
      "Place your hands on your knees, palms down.",
      "Inhale through your nose.",
      "Exhale forcefully through your mouth, pulling your abdominal muscles in.",
      "Repeat the breathing pattern at a steady pace.",
      "Continue for the duration of the posture."
    ]
  }
};

export default function Bikram26PracticePage() {
  const { language } = useLanguage();
  const dict = dictionaries[language].bikram26.practice;
  const router = useRouter();
  
  // State for practice
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPostureIndex, setCurrentPostureIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [caption, setCaption] = useState('');
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const instructionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current posture
  const currentPosture = dict.postures[currentPostureIndex];
  
  // Get current posture instructions
  const currentPostureInstructions = currentPosture ? 
    postureInstructions[currentPosture.id]?.instructions || [] : [];

  // Calculate total practice time
  const totalPracticeTime = dict.postures.reduce((total, posture) => {
    return total + (posture.duration * posture.sets);
  }, 0);

  // Effect to handle timer
  useEffect(() => {
    if (isStarted && !isPaused) {
      if (timeRemaining === 0) {
        // Move to next posture or set
        if (currentSet < currentPosture.sets) {
          // Move to next set of the same posture
          setCurrentSet(currentSet + 1);
          setTimeRemaining(currentPosture.duration);
          updateCaption(currentPostureIndex, currentSet + 1);
          setCurrentInstructionIndex(0); // Reset instruction index for new set
        } else {
          // Move to next posture
          const nextIndex = currentPostureIndex + 1;
          if (nextIndex < dict.postures.length) {
            setCurrentPostureIndex(nextIndex);
            setCurrentSet(1);
            setTimeRemaining(dict.postures[nextIndex].duration);
            updateCaption(nextIndex, 1);
            setCurrentInstructionIndex(0); // Reset instruction index for new posture
          } else {
            // Practice completed
            setIsStarted(false);
            setCaption('Practice completed!');
          }
        }
      } else {
        // Start the timer
        timerRef.current = setTimeout(() => {
          setTimeRemaining(timeRemaining - 1);
          setTotalElapsedTime(totalElapsedTime + 1);
          
          // Update caption based on time remaining
          if (timeRemaining === currentPosture.duration - 10) {
            updateCaption(currentPostureIndex, currentSet);
          }
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isStarted, isPaused, timeRemaining, currentPostureIndex, currentSet, currentPosture, totalElapsedTime]);

  // Effect to cycle through instructions
  useEffect(() => {
    if (isStarted && !isPaused && currentPostureInstructions.length > 0) {
      // Calculate time to show each instruction based on posture duration and number of instructions
      const instructionDuration = Math.max(
        8, // Minimum 8 seconds per instruction
        Math.floor(currentPosture.duration / currentPostureInstructions.length)
      );
      
      instructionTimerRef.current = setTimeout(() => {
        // Cycle to next instruction or loop back to first
        setCurrentInstructionIndex(
          (prevIndex) => (prevIndex + 1) % currentPostureInstructions.length
        );
      }, instructionDuration * 1000);
    }

    return () => {
      if (instructionTimerRef.current) {
        clearTimeout(instructionTimerRef.current);
      }
    };
  }, [isStarted, isPaused, currentInstructionIndex, currentPostureInstructions, currentPosture]);

  // Function to update captions based on posture and time
  const updateCaption = (postureIndex: number, set: number) => {
    const posture = dict.postures[postureIndex];
    setCaption(`${posture.name} - Set ${set} of ${posture.sets}`);
  };

  // Start practice
  const startPractice = () => {
    setIsStarted(true);
    setIsPaused(false);
    setCurrentPostureIndex(0);
    setCurrentSet(1);
    setTimeRemaining(dict.postures[0].duration);
    setTotalElapsedTime(0);
    setCurrentInstructionIndex(0);
    updateCaption(0, 1);
  };

  // Toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Navigate to previous posture
  const goToPreviousPosture = () => {
    if (currentPostureIndex > 0) {
      const prevIndex = currentPostureIndex - 1;
      setCurrentPostureIndex(prevIndex);
      setCurrentSet(1);
      setTimeRemaining(dict.postures[prevIndex].duration);
      setCurrentInstructionIndex(0);
      updateCaption(prevIndex, 1);
    }
  };

  // Navigate to next posture
  const goToNextPosture = () => {
    if (currentPostureIndex < dict.postures.length - 1) {
      const nextIndex = currentPostureIndex + 1;
      setCurrentPostureIndex(nextIndex);
      setCurrentSet(1);
      setTimeRemaining(dict.postures[nextIndex].duration);
      setCurrentInstructionIndex(0);
      updateCaption(nextIndex, 1);
    }
  };

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Format time for longer durations (includes hours)
  const formatLongTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ''}${mins < 10 && hours > 0 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Navigate to specific posture page
  const navigateToPosturePage = (postureId: string) => {
    router.push(`/yoga/bikram-26/practice/${postureId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900 dark:to-green-950 text-green-900 dark:text-green-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{dict.title}</h1>
          <p className="text-xl md:text-2xl text-green-700 dark:text-green-300">{dict.subtitle}</p>
          <p className="text-lg mt-2">Total Practice Time: {formatLongTime(totalPracticeTime)}</p>
        </motion.div>

        {!isStarted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center space-y-8"
          >
            <button
              onClick={startPractice}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transition-all transform hover:scale-105"
            >
              {dict.startButton}
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
              {dict.postures.map((posture, index) => (
                <motion.div
                  key={posture.id}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white dark:bg-green-800 rounded-lg shadow-md p-4 cursor-pointer"
                  onClick={() => navigateToPosturePage(posture.id)}
                >
                  <div className="font-bold text-lg">{index + 1}. {posture.name}</div>
                  <div className="text-sm text-green-600 dark:text-green-300">{posture.sanskritName}</div>
                  <div className="text-xs mt-2">
                    {posture.sets} {posture.sets === 1 ? 'set' : 'sets'} × {formatTime(posture.duration)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center space-y-8"
          >
            <div className="w-full max-w-4xl bg-white dark:bg-green-800 rounded-xl shadow-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">
                  {currentPostureIndex + 1}. {currentPosture.name}
                </h2>
                <div className="flex flex-col items-end">
                  <div className="text-xl font-mono bg-green-100 dark:bg-green-700 px-4 py-2 rounded-lg mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm">
                    Elapsed: {formatLongTime(totalElapsedTime)} / {formatLongTime(totalPracticeTime)}
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-xl text-green-600 dark:text-green-300 mb-2">
                  {currentPosture.sanskritName}
                </div>
                <div className="text-lg">
                  {caption}
                </div>
              </div>

              {/* Instruction Display */}
              <div className="bg-green-50 dark:bg-green-700/50 rounded-lg p-6 mb-6 min-h-[120px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentPostureIndex}-${currentSet}-${currentInstructionIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-lg md:text-xl text-center font-medium"
                  >
                    {currentPostureInstructions[currentInstructionIndex] || "Prepare for the posture..."}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Instruction Navigation */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setCurrentInstructionIndex(prev => 
                    prev > 0 ? prev - 1 : currentPostureInstructions.length - 1
                  )}
                  className="text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-700 p-2 rounded-full"
                >
                  ←
                </button>
                <div className="text-sm">
                  Instruction {currentInstructionIndex + 1} of {currentPostureInstructions.length}
                </div>
                <button
                  onClick={() => setCurrentInstructionIndex(prev => 
                    (prev + 1) % currentPostureInstructions.length
                  )}
                  className="text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-700 p-2 rounded-full"
                >
                  →
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={goToPreviousPosture}
                  disabled={currentPostureIndex === 0}
                  className="bg-green-200 dark:bg-green-700 text-green-800 dark:text-white py-2 px-4 rounded-lg disabled:opacity-50"
                >
                  {dict.prevButton}
                </button>
                <button
                  onClick={togglePause}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
                >
                  {isPaused ? dict.resumeButton : dict.pauseButton}
                </button>
                <button
                  onClick={goToNextPosture}
                  disabled={currentPostureIndex === dict.postures.length - 1}
                  className="bg-green-200 dark:bg-green-700 text-green-800 dark:text-white py-2 px-4 rounded-lg disabled:opacity-50"
                >
                  {dict.nextButton}
                </button>
              </div>
              
              <div className="mt-6 text-center">
                <Link 
                  href={`/yoga/bikram-26/practice/${currentPosture.id}`}
                  className="text-green-600 dark:text-green-300 hover:underline"
                >
                  View detailed instructions
                </Link>
              </div>
            </div>
            
            <div className="w-full max-w-4xl">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200">
                      {dict.timeRemaining}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-green-600 dark:text-green-300">
                      {Math.round((timeRemaining / currentPosture.duration) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200 dark:bg-green-700">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeRemaining / currentPosture.duration) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600"
                  ></motion.div>
                </div>
              </div>
              
              {/* Overall progress bar */}
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200">
                      Overall Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-green-600 dark:text-green-300">
                      {Math.round((totalElapsedTime / totalPracticeTime) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200 dark:bg-green-700">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${(totalElapsedTime / totalPracticeTime) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600"
                  ></motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 