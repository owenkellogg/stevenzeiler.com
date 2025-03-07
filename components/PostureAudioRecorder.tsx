import { useState, useRef, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { PostureAudioRecording, AudioRecordingFormData } from '@/types/posture-audio';
import { useLanguage } from '@/utils/i18n/LanguageProvider';
import { dictionaries } from '@/utils/i18n/dictionaries';

interface PostureAudioRecorderProps {
  postureId: string;
  series?: string;
  onRecordingAdded?: () => void;
}

export default function PostureAudioRecorder({ 
  postureId, 
  series = 'bikram-26',
  onRecordingAdded
}: PostureAudioRecorderProps) {
  const { language } = useLanguage();
  const dict = dictionaries[language].bikram26.practice;
  const [recordings, setRecordings] = useState<PostureAudioRecording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [postureName, setPostureName] = useState<string>('');
  const [formData, setFormData] = useState<AudioRecordingFormData>({
    title: '',
    description: '',
    language: language,
    is_default: false
  });
  const [showScriptEditor, setShowScriptEditor] = useState(false);
  const [scriptEditorRecordingId, setScriptEditorRecordingId] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Get posture name from dictionary
  useEffect(() => {
    // Find the posture in the dictionary
    const posture = dict.postures.find(p => p.id === postureId);
    if (posture) {
      setPostureName(posture.name);
      
      // Auto-populate title and description with posture name
      const timestamp = new Date().toLocaleString();
      setFormData(prev => ({
        ...prev,
        title: `${posture.name} - ${language === 'en' ? 'English' : 'Spanish'}`,
        description: `Recorded on ${timestamp}`
      }));
    }
  }, [postureId, language, dict.postures]);
  
  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(user?.email === 'me@stevenzeiler.com');
    };
    
    checkAdmin();
  }, []);
  
  // Load existing recordings
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('posture_audio_recordings')
          .select('*')
          .eq('posture_id', postureId)
          .eq('series', series)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setRecordings(data || []);
      } catch (err) {
        console.error('Error fetching recordings:', err);
        setError('Failed to load recordings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecordings();
  }, [postureId, series]);
  
  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);
  
  // Start recording
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(audioUrl);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Auto-update title and description with recording duration
        const duration = formatTime(recordingTime);
        setFormData(prev => ({
          ...prev,
          title: `${postureName} - ${language === 'en' ? 'English' : 'Spanish'} (${duration})`,
          description: `${prev.description} - Duration: ${duration}`
        }));
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear previous recording if exists
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      
      const url = URL.createObjectURL(file);
      setAudioBlob(file);
      setAudioURL(url);
      
      // Auto-update title and description with file name
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      setFormData(prev => ({
        ...prev,
        title: `${postureName} - ${language === 'en' ? 'English' : 'Spanish'} (${fileName})`,
        description: `Uploaded file: ${file.name} - Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      }));
    }
  };
  
  // Save recording to Supabase
  const saveRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioBlob && !formData.audio_file) {
      setError('No audio recording or file to save');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Upload audio file to storage
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${postureId}_${series}_${formData.language}_${timestamp}.wav`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posture_audio')
        .upload(fileName, audioBlob || formData.audio_file!);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('posture_audio')
        .getPublicUrl(fileName);
      
      // Save recording metadata to database
      const { data: recordingData, error: recordingError } = await supabase
        .from('posture_audio_recordings')
        .insert({
          posture_id: postureId,
          series,
          language: formData.language,
          title: formData.title,
          description: formData.description || null,
          audio_url: publicUrl,
          script_text: formData.script_text || null,
          is_default: formData.is_default
        })
        .select()
        .single();
        
      if (recordingError) throw recordingError;
      
      // Update recordings list
      setRecordings(prev => [recordingData, ...prev]);
      
      // Reset form and recording state
      const newTimestamp = new Date().toLocaleString();
      setFormData({
        title: `${postureName} - ${language === 'en' ? 'English' : 'Spanish'}`,
        description: `Recorded on ${newTimestamp}`,
        language: language,
        is_default: false
      });
      setAudioBlob(null);
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setAudioURL(null);
      }
      
      // Notify parent component
      if (onRecordingAdded) {
        onRecordingAdded();
      }
      
    } catch (err) {
      console.error('Error saving recording:', err);
      setError('Failed to save recording');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Open script editor for a recording
  const openScriptEditor = (recordingId: string) => {
    setScriptEditorRecordingId(recordingId);
    
    // Find the recording and set the script text in the form
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      setFormData(prev => ({
        ...prev,
        script_text: recording.script_text || ''
      }));
    }
    
    setShowScriptEditor(true);
  };
  
  // Save script text for a recording
  const saveScriptText = async () => {
    if (!scriptEditorRecordingId || !formData.script_text) {
      setError('No script text to save');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('posture_audio_recordings')
        .update({ script_text: formData.script_text })
        .eq('id', scriptEditorRecordingId);
        
      if (error) throw error;
      
      // Update recordings list
      setRecordings(prev => prev.map(rec => 
        rec.id === scriptEditorRecordingId 
          ? { ...rec, script_text: formData.script_text || null } 
          : rec
      ));
      
      // Close script editor
      setShowScriptEditor(false);
      setScriptEditorRecordingId(null);
      setFormData(prev => ({ ...prev, script_text: '' }));
      
    } catch (err) {
      console.error('Error saving script text:', err);
      setError('Failed to save script text');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set recording as default
  const setAsDefault = async (recordingId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('posture_audio_recordings')
        .update({ is_default: true })
        .eq('id', recordingId);
        
      if (error) throw error;
      
      // Update recordings list
      setRecordings(prev => prev.map(rec => ({
        ...rec,
        is_default: rec.id === recordingId
      })));
      
    } catch (err) {
      console.error('Error setting default recording:', err);
      setError('Failed to set default recording');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete recording
  const deleteRecording = async (recordingId: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get the recording to delete
      const recordingToDelete = recordings.find(r => r.id === recordingId);
      if (!recordingToDelete) throw new Error('Recording not found');
      
      // Extract file name from URL
      const fileName = recordingToDelete.audio_url.split('/').pop();
      if (!fileName) throw new Error('Invalid file URL');
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('posture_audio')
        .remove([fileName]);
        
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('posture_audio_recordings')
        .delete()
        .eq('id', recordingId);
        
      if (dbError) throw dbError;
      
      // Update recordings list
      setRecordings(prev => prev.filter(rec => rec.id !== recordingId));
      
    } catch (err) {
      console.error('Error deleting recording:', err);
      setError('Failed to delete recording');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save script only (without audio)
  const saveScriptOnly = async () => {
    if (!formData.script_text) {
      setError('No script text to save');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create a new recording with just the script
      const { data: recordingData, error: recordingError } = await supabase
        .from('posture_audio_recordings')
        .insert({
          posture_id: postureId,
          series,
          language: formData.language,
          title: formData.title || `${postureName} Script - ${formData.language === 'en' ? 'English' : 'Spanish'}`,
          description: formData.description || `Script added on ${new Date().toLocaleString()}`,
          // Use a placeholder audio URL (we'll need to create a silent audio file in storage)
          audio_url: 'https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/posture_audio/silent.mp3',
          script_text: formData.script_text,
          is_default: formData.is_default
        })
        .select()
        .single();
        
      if (recordingError) throw recordingError;
      
      // Update recordings list
      setRecordings(prev => [recordingData, ...prev]);
      
      // Reset form state
      const newTimestamp = new Date().toLocaleString();
      setFormData({
        title: `${postureName} - ${language === 'en' ? 'English' : 'Spanish'}`,
        description: `Recorded on ${newTimestamp}`,
        language: language,
        script_text: '',
        is_default: false
      });
      
      // Notify parent component
      if (onRecordingAdded) {
        onRecordingAdded();
      }
      
    } catch (err) {
      console.error('Error saving script:', err);
      setError('Failed to save script');
    } finally {
      setIsLoading(false);
    }
  };
  
  // If not admin, don't show the recorder
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-green-800 rounded-xl shadow-lg p-6 mt-8">
      <h3 className="text-xl font-bold mb-4 border-b border-green-200 dark:border-green-700 pb-2">
        Posture Audio Recordings (Admin)
      </h3>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-3 rounded-lg mb-4">
          {error}
          <button 
            className="ml-2 text-red-600 dark:text-red-300 font-bold"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Script Editor Modal */}
      {showScriptEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-green-800 rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <h4 className="text-xl font-bold mb-4 border-b border-green-200 dark:border-green-700 pb-2">
              Edit Script Text
            </h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Full Dialog Script</label>
              <textarea
                name="script_text"
                value={formData.script_text || ''}
                onChange={handleInputChange}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
                placeholder="Enter the full dialog script for this posture..."
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter the complete dialog script for this posture. This will be used as a reference for recording.
              </p>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowScriptEditor(false);
                  setScriptEditorRecordingId(null);
                }}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveScriptText}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Script'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Record New Audio</h4>
        
        <div className="flex items-center space-x-4 mb-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isRecording || isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              disabled={!isRecording || isLoading}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Stop Recording ({formatTime(recordingTime)})
            </button>
          )}
          
          <div className="text-sm">or</div>
          
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={isRecording || isLoading}
            className="text-sm text-gray-600 dark:text-gray-300"
          />
        </div>
        
        {audioURL && (
          <div className="mb-4">
            <audio src={audioURL} controls className="w-full" />
          </div>
        )}
        
        <form onSubmit={saveRecording}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Full Dialog Script (Optional)</label>
            <textarea
              name="script_text"
              value={formData.script_text || ''}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
              placeholder="Enter the full dialog script for this posture..."
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter the complete dialog script for this posture. This will be used as a reference for recording.
            </p>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_default"
                checked={formData.is_default}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span>Set as default for this language</span>
            </label>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={!audioBlob && !formData.audio_file || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Recording with Script'}
            </button>
            
            <button
              type="button"
              onClick={saveScriptOnly}
              disabled={!formData.script_text || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Script Only'}
            </button>
          </div>
        </form>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2">Existing Recordings</h4>
        
        {isLoading && <div className="text-center py-4">Loading...</div>}
        
        {!isLoading && recordings.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No recordings yet
          </div>
        )}
        
        <div className="space-y-4">
          {recordings.map(recording => (
            <div 
              key={recording.id}
              className={`border ${recording.is_default ? 'border-green-500 dark:border-green-400' : 'border-gray-300 dark:border-gray-600'} rounded-lg p-4`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-medium">
                    {recording.title}
                    {recording.is_default && (
                      <span className="ml-2 text-xs bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                        Default ({recording.language})
                      </span>
                    )}
                  </h5>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Language: {recording.language === 'en' ? 'English' : 'Spanish'}
                  </div>
                  {recording.description && (
                    <p className="text-sm mt-1">{recording.description}</p>
                  )}
                  {recording.script_text && (
                    <div className="mt-2">
                      <button
                        onClick={() => openScriptEditor(recording.id)}
                        className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
                      >
                        View/Edit Script
                      </button>
                    </div>
                  )}
                  {!recording.script_text && (
                    <div className="mt-2">
                      <button
                        onClick={() => openScriptEditor(recording.id)}
                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        Add Script
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {!recording.is_default && (
                    <button
                      onClick={() => setAsDefault(recording.id)}
                      className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => deleteRecording(recording.id)}
                    className="text-xs bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <audio src={recording.audio_url} controls className="w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 