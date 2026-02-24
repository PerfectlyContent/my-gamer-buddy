import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Send, Image, X, Mic, MicOff, Loader2 } from 'lucide-react';
import { playSound, triggerHaptic } from '@/lib/sounds';

interface ChatInputProps {
  onSend: (message: string, image?: File) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxFiles: 1,
    noClick: true,
  });

  const handleSend = () => {
    if ((!message.trim() && !image) || disabled) return;
    playSound('send');
    triggerHaptic('tap');
    onSend(message.trim(), image || undefined);
    setMessage('');
    setImage(null);
    setImagePreview(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      triggerHaptic('double');
      setIsRecording(true);

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMessage((prev) => prev + (prev ? ' ' : '') + transcript);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
          mediaRecorderRef.current?.stop();
        };

        recognition.start();
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  return (
    <div className="glass-surface border-t border-white/[0.06] p-3 lg:p-4">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img src={imagePreview} alt="Preview" className="h-16 glass rounded-xl" />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-gaming-red rounded-full p-0.5 hover:bg-red-600 transition"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div
        {...getRootProps()}
        className={`flex items-center gap-2.5 p-1.5 rounded-2xl glass-card border border-white/10 transition-all focus-within:border-gaming-blue/40 focus-within:shadow-[0_0_16px_rgba(0,212,255,0.12)] ${
          isDragActive ? 'border-gaming-blue shadow-lg shadow-gaming-blue/20' : ''
        }`}
      >
        <input {...getInputProps()} />

        {/* Image upload button */}
        <label className="flex-shrink-0 p-2 cursor-pointer text-gaming-muted hover:text-gaming-blue transition-colors">
          <Image className="w-5 h-5" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
              }
            }}
          />
        </label>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleTextareaInput}
          placeholder={isDragActive ? 'Drop screenshot here...' : 'Ask your buddy...'}
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent py-2 text-sm text-gaming-text placeholder-gaming-muted resize-none outline-none border-none focus:ring-0 max-h-[120px] min-w-0"
        />

        {/* Voice button */}
        <button
          onClick={toggleRecording}
          disabled={disabled}
          className={`flex-shrink-0 p-2 transition-colors ${
            isRecording
              ? 'text-gaming-red animate-pulse'
              : 'text-gaming-muted hover:text-gaming-green'
          }`}
        >
          {isRecording ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
        </button>

        {/* Send button — cyan */}
        <button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !image)}
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-gaming-blue flex items-center justify-center text-gaming-bg shadow-glow-teal-sm active:scale-95 transition-all disabled:opacity-40 disabled:shadow-none disabled:scale-100"
        >
          {disabled ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
