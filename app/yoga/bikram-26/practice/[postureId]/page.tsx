'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/utils/i18n/LanguageProvider';
import { dictionaries } from '@/utils/i18n/dictionaries';

// Define the posture instructions
const postureInstructions: Record<string, { instructions: string[], benefits: string[] }> = {
  '1-pranayama': {
    instructions: [
      "Stand with your feet together, heels and toes touching.",
      "Interlock your fingers and place them under your chin.",
      "Inhale through your nose as you raise your elbows up to shoulder height.",
      "Hold your breath and tilt your head back.",
      "Exhale through your mouth as you lower your elbows and head back to the starting position.",
      "Repeat for the duration of the posture."
    ],
    benefits: [
      "Improves lung capacity",
      "Increases oxygen intake",
      "Calms the nervous system",
      "Prepares the body for the practice"
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
    ],
    benefits: [
      "Stretches the entire side of the body",
      "Improves flexibility in the spine",
      "Tones the abdominal muscles",
      "Stimulates the digestive system"
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
    ],
    benefits: [
      "Strengthens the thighs, calves, and ankles",
      "Improves balance and concentration",
      "Relieves rheumatism in the legs",
      "Helps with flat feet and fallen arches"
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
    ],
    benefits: [
      "Improves balance and concentration",
      "Strengthens the legs, ankles, and hips",
      "Relieves sciatica and rheumatism in the legs",
      "Creates space in the joints"
    ]
  },
  '5-standing-head-to-knee': {
    instructions: [
      "Stand with your feet together.",
      "Lift your right leg and hold your foot with both hands.",
      "Extend your right leg forward while keeping it straight.",
      "Bring your forehead toward your knee while keeping your standing leg straight.",
      "Hold for 20 seconds, then repeat on the other side."
    ],
    benefits: [
      "Improves balance and concentration",
      "Strengthens the standing leg",
      "Stretches the hamstrings",
      "Stimulates the digestive system"
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
    ],
    benefits: [
      "Improves balance and concentration",
      "Strengthens the legs and spine",
      "Opens the shoulders and chest",
      "Increases circulation to the heart and lungs"
    ]
  },
  '7-balancing-stick': {
    instructions: [
      "Stand with your feet together, arms overhead with palms together.",
      "Step forward with your right foot.",
      "Lean forward, bringing your torso and left leg parallel to the floor.",
      "Keep your arms, torso, and raised leg in one straight line.",
      "Hold for 10 seconds, then repeat on the other side."
    ],
    benefits: [
      "Improves balance and concentration",
      "Strengthens the legs and core",
      "Increases circulation to the heart",
      "Tones the abdominal muscles"
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
    ],
    benefits: [
      "Stretches the hamstrings and inner thighs",
      "Improves flexibility in the spine",
      "Stimulates the digestive system",
      "Relieves tension in the back"
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
    ],
    benefits: [
      "Strengthens the legs and core",
      "Stretches the hamstrings and inner thighs",
      "Improves flexibility in the spine",
      "Stimulates the digestive system"
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
    ],
    benefits: [
      "Stretches the hamstrings and inner thighs",
      "Improves flexibility in the spine",
      "Stimulates the digestive system",
      "Relieves tension in the back"
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
    ],
    benefits: [
      "Improves balance and concentration",
      "Strengthens the legs and core",
      "Opens the hips",
      "Calms the mind"
    ]
  },
  '12-toe-stand': {
    instructions: [
      "From Tree Pose, bend your standing leg and lower your body down.",
      "Balance on the ball of your right foot, keeping your left foot on your right thigh.",
      "Bring your hands to prayer position at your chest.",
      "Hold for 20 seconds, then repeat on the other side."
    ],
    benefits: [
      "Improves balance and concentration",
      "Strengthens the legs and ankles",
      "Opens the hips",
      "Builds mental focus"
    ]
  },
  '13-corpse': {
    instructions: [
      "Lie on your back with your feet slightly apart.",
      "Place your arms at your sides, palms up.",
      "Close your eyes and relax your entire body.",
      "Breathe naturally and let go of any tension.",
      "Stay completely still."
    ],
    benefits: [
      "Relaxes the body and mind",
      "Reduces stress and anxiety",
      "Lowers blood pressure",
      "Allows the body to integrate the benefits of the previous postures"
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
    ],
    benefits: [
      "Massages the ascending and descending colons",
      "Relieves gas and constipation",
      "Strengthens the lower back",
      "Stimulates the digestive system"
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
    ],
    benefits: [
      "Strengthens the abdominal muscles",
      "Improves core stability",
      "Enhances flexibility in the spine",
      "Prepares the body for the next posture"
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
    ],
    benefits: [
      "Strengthens the spine and back muscles",
      "Opens the chest and shoulders",
      "Stimulates the digestive organs",
      "Relieves stress and fatigue"
    ]
  },
  '17-locust': {
    instructions: [
      "Lie on your stomach with your arms under your body, palms down.",
      "Keep your chin on the floor.",
      "Lift your right leg as high as possible without bending the knee.",
      "Hold for 10 seconds, then lower and repeat with the left leg.",
      "Finally, lift both legs simultaneously."
    ],
    benefits: [
      "Strengthens the lower back and legs",
      "Improves flexibility in the spine",
      "Stimulates the digestive organs",
      "Relieves sciatica and lower back pain"
    ]
  },
  '18-full-locust': {
    instructions: [
      "Lie on your stomach with your arms extended alongside your body.",
      "Lift your arms, upper body, and legs off the floor simultaneously.",
      "Balance on your abdomen.",
      "Keep your legs straight and together.",
      "Hold for 10 seconds."
    ],
    benefits: [
      "Strengthens the entire back body",
      "Improves posture",
      "Stimulates the digestive organs",
      "Increases energy and vitality"
    ]
  },
  '19-bow': {
    instructions: [
      "Lie on your stomach.",
      "Bend your knees and grab your ankles from the outside.",
      "Kick your legs up and back while lifting your chest off the floor.",
      "Look forward and breathe normally.",
      "Hold for 20 seconds."
    ],
    benefits: [
      "Strengthens the back and abdominal muscles",
      "Opens the chest and shoulders",
      "Improves flexibility in the spine",
      "Stimulates the digestive organs"
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
    ],
    benefits: [
      "Stretches the ankles, knees, and thighs",
      "Improves flexibility in the hips and lower back",
      "Stimulates the kidneys and digestive organs",
      "Relieves lower back pain"
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
    ],
    benefits: [
      "Stretches the lower back and shoulders",
      "Calms the mind and relieves stress",
      "Improves circulation to the brain",
      "Relieves headaches and fatigue"
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
    ],
    benefits: [
      "Stretches the entire front of the body",
      "Improves flexibility in the spine",
      "Opens the chest and shoulders",
      "Stimulates the thyroid and parathyroid glands"
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
    ],
    benefits: [
      "Stretches the spine and shoulders",
      "Stimulates the nervous system",
      "Relieves tension in the neck and back",
      "Improves circulation to the brain"
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
    ],
    benefits: [
      "Stretches the hamstrings and lower back",
      "Stimulates the digestive organs",
      "Calms the mind and relieves stress",
      "Improves flexibility in the spine"
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
    ],
    benefits: [
      "Improves flexibility in the spine",
      "Stimulates the digestive organs",
      "Relieves lower back pain",
      "Detoxifies the internal organs"
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
    ],
    benefits: [
      "Cleanses the lungs and respiratory system",
      "Strengthens the abdominal muscles",
      "Improves digestion",
      "Increases oxygen intake"
    ]
  }
};

export default function PosturePage({ params }: { params: { postureId: string } }) {
  const { language } = useLanguage();
  const dict = dictionaries[language].bikram26.practice;
  const [posture, setPosture] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Find the posture in the dictionary
    const foundPosture = dict.postures.find(p => p.id === params.postureId);
    if (foundPosture) {
      setPosture(foundPosture);
    }
    setLoading(false);
  }, [params.postureId, dict.postures]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900 dark:to-green-950 text-green-900 dark:text-green-50 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!posture) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900 dark:to-green-950 text-green-900 dark:text-green-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">Posture Not Found</h1>
        <p className="mb-6">The posture you are looking for does not exist.</p>
        <Link 
          href="/yoga/bikram-26/practice"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          Return to Practice
        </Link>
      </div>
    );
  }

  const postureData = postureInstructions[params.postureId];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900 dark:to-green-950 text-green-900 dark:text-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/yoga/bikram-26/practice"
            className="text-green-600 dark:text-green-300 hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Practice
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{posture.name}</h1>
          <h2 className="text-xl md:text-2xl text-green-600 dark:text-green-300 mb-4">{posture.sanskritName}</h2>
          <div className="text-sm mb-6">
            {posture.sets} {posture.sets === 1 ? 'set' : 'sets'} × {posture.duration} seconds
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-green-800 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold mb-4 border-b border-green-200 dark:border-green-700 pb-2">Instructions</h3>
            <ol className="list-decimal pl-5 space-y-3">
              {postureData?.instructions.map((instruction, index) => (
                <li key={index} className="text-base">{instruction}</li>
              ))}
            </ol>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-green-800 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold mb-4 border-b border-green-200 dark:border-green-700 pb-2">Benefits</h3>
            <ul className="list-disc pl-5 space-y-3">
              {postureData?.benefits.map((benefit, index) => (
                <li key={index} className="text-base">{benefit}</li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="mt-8 flex justify-between">
          {getPreviousPosture(dict.postures, params.postureId) && (
            <Link 
              href={`/yoga/bikram-26/practice/${getPreviousPosture(dict.postures, params.postureId)?.id}`}
              className="bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 text-green-800 dark:text-green-100 font-medium py-2 px-4 rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {getPreviousPosture(dict.postures, params.postureId)?.name}
            </Link>
          )}
          
          {getNextPosture(dict.postures, params.postureId) && (
            <Link 
              href={`/yoga/bikram-26/practice/${getNextPosture(dict.postures, params.postureId)?.id}`}
              className="bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 text-green-800 dark:text-green-100 font-medium py-2 px-4 rounded-lg flex items-center"
            >
              {getNextPosture(dict.postures, params.postureId)?.name}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions to get previous and next postures
function getPreviousPosture(postures: any[], currentId: string) {
  const currentIndex = postures.findIndex(p => p.id === currentId);
  if (currentIndex > 0) {
    return postures[currentIndex - 1];
  }
  return null;
}

function getNextPosture(postures: any[], currentId: string) {
  const currentIndex = postures.findIndex(p => p.id === currentId);
  if (currentIndex < postures.length - 1) {
    return postures[currentIndex + 1];
  }
  return null;
} 