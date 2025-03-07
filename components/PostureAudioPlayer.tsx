import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { PostureAudioRecording, PostureAudioPlayerSettings } from '@/types/posture-audio';

interface PostureAudioPlayerProps {
  postureId: string;
  series?: string;
  language: string;
  enabled: boolean;
  volume: number;
  isPaused: boolean;
  onPlaybackComplete?: () => void;
}

export default function PostureAudioPlayer({
  postureId,
  series = 'bikram-26',
  language,
  enabled,
  volume,
  isPaused,
  onPlaybackComplete
}: PostureAudioPlayerProps) {
  const [recording, setRecording] = useState<PostureAudioRecording | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabaseRef = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));
  
  // Create audio element only once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
      
      // Set up event listeners
      const audio = audioRef.current;
      
      const handleEnded = () => {
        setIsPlaying(false);
        if (onPlaybackComplete) {
          onPlaybackComplete();
        }
      };
      
      audio.addEventListener('ended', handleEnded);
      
      // Cleanup on unmount
      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
        audio.src = '';
        audioRef.current = null;
      };
    }
  }, []);
  
  // Load default recording for this posture and language
  useEffect(() => {
    const fetchRecording = async () => {
      if (!enabled || !postureId) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabaseRef.current
          .from('posture_audio_recordings')
          .select('*')
          .eq('posture_id', postureId)
          .eq('series', series)
          .eq('language', language)
          .eq('is_default', true)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setRecording(data);
        } else if (language !== 'en') {
          // If no default recording in the selected language, try English as fallback
          const { data: fallbackData, error: fallbackError } = await supabaseRef.current
            .from('posture_audio_recordings')
            .select('*')
            .eq('posture_id', postureId)
            .eq('series', series)
            .eq('language', 'en')
            .eq('is_default', true)
            .maybeSingle();
            
          if (fallbackError) throw fallbackError;
          setRecording(fallbackData);
        } else {
          setRecording(null);
        }
      } catch (err) {
        console.error('Error fetching recording:', err);
        setError('Failed to load audio recording');
        setRecording(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Reset state when posture changes
    setIsPlaying(false);
    
    fetchRecording();
    
    // Cleanup when posture changes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [postureId, series, language, enabled]);
  
  // Update audio source when recording changes
  useEffect(() => {
    if (!audioRef.current || !recording) return;
    
    // Stop any current playback
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    
    // Set new source
    audioRef.current.src = recording.audio_url;
    audioRef.current.volume = volume;
    
    // Start playing if enabled and not paused
    if (enabled && !isPaused) {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log(`Playing audio for ${postureId}`);
          })
          .catch(err => {
            console.error('Error playing audio:', err);
            setError('Failed to play audio');
            setIsPlaying(false);
          });
      }
    }
  }, [recording, enabled, volume, postureId]);
  
  // Handle pause state changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPaused && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (!isPaused && recording && !isPlaying) {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Error resuming audio:', err);
          });
      }
    }
  }, [isPaused, isPlaying, recording]);
  
  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // If not enabled or no recording, don't render anything
  if (!enabled || !recording) {
    return null;
  }
  
  return null; // No need to render anything, we're using the audio element directly
} 