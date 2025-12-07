import React, { useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface VideoPlayerProps {
  onBack: () => void;
  title: string;
  videoUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ onBack, title, videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto-play when mounted
    if(videoRef.current) {
        videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    }
  }, []);

  const defaultVideo = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className="fixed inset-0 z-[60] bg-black text-white">
      {/* Controls Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex items-center bg-gradient-to-b from-black/80 to-transparent z-10 transition-opacity hover:opacity-100 opacity-0 duration-300">
        <button onClick={onBack} className="mr-4 hover:scale-110 transition">
          <ArrowLeft className="w-8 h-8" />
        </button>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        src={videoUrl || defaultVideo}
        poster="https://peach.blender.org/wp-content/uploads/title_anouncement.jpg"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;