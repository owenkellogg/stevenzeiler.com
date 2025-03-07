export interface PostureAudioRecording {
  id: string;
  posture_id: string;
  series: string;
  language: string;
  title: string;
  description: string | null;
  audio_url: string;
  script_text: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface AudioRecordingFormData {
  title: string;
  description?: string;
  language: string;
  audio_file?: File;
  script_text?: string;
  is_default: boolean;
}

export interface PostureAudioPlayerSettings {
  enabled: boolean;
  volume: number;
  language: string;
} 