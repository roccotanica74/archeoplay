import React, { useEffect, useState } from 'react';
import { X, Play, Plus, Check, ThumbsUp, Volume2, VolumeX } from 'lucide-react';
import { Movie } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ModalProps {
  movie: Movie | null;
  onClose: () => void;
  onPlay: () => void;
  onToggleMyList: (movie: Movie) => void;
  isInMyList: boolean;
}

const Modal: React.FC<ModalProps> = ({ movie, onClose, onPlay, onToggleMyList, isInMyList }) => {
  const [muted, setMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Reset state when movie changes
    setShowVideo(false);
  }, [movie]);

  if (!movie) return null;

  const matchData = [
    { name: 'Match', value: movie.matchScore },
    { name: 'Rest', value: 100 - movie.matchScore }
  ];

  // Deterministic seed for image fallback
  const seed = movie.id.replace(/\D/g, '') || movie.title.length;
  // Use uploaded backdrop/thumbnail first, then fall back to generated image
  const backdropUrl = movie.backdropUrl || movie.thumbnailUrl || `https://picsum.photos/seed/${movie.title.replace(/ /g,'')}${seed}/900/500`;

  return (
    <div className="fixed inset-0 z-50 !mt-0 grid place-items-center overflow-y-auto overflow-x-hidden bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[850px] overflow-hidden rounded-md bg-[#181818] shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-[#181818] hover:bg-[#181818]/70"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {/* Video/Backdrop Area */}
        <div className="relative aspect-video w-full">
            <img
              src={backdropUrl}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#181818] to-transparent" />
            
            <div className="absolute bottom-10 left-10">
              <h1 className="text-3xl font-bold md:text-5xl text-white mb-4 drop-shadow-lg">
                {movie.title}
              </h1>
              <div className="flex gap-x-3">
                <button 
                  onClick={onPlay}
                  className="flex items-center gap-x-2 rounded bg-white px-8 py-2 text-xl font-bold text-black transition hover:bg-[#e6e6e6]"
                >
                  <Play className="h-7 w-7 fill-black" />
                  Play
                </button>
                <button 
                    onClick={() => onToggleMyList(movie)}
                    className="flex items-center justify-center rounded-full border-2 border-[gray] bg-[#2a2a2a]/60 p-2 transition hover:border-white hover:bg-white/10"
                    title={isInMyList ? "Remove from My List" : "Add to My List"}
                >
                  {isInMyList ? <Check className="h-6 w-6 text-white" /> : <Plus className="h-6 w-6 text-white" />}
                </button>
                <button className="flex items-center justify-center rounded-full border-2 border-[gray] bg-[#2a2a2a]/60 p-2 transition hover:border-white hover:bg-white/10">
                  <ThumbsUp className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>

             <button 
                onClick={() => setMuted(!muted)}
                className="absolute bottom-10 right-10 rounded-full border-2 border-[gray] bg-[#2a2a2a]/60 p-2 transition hover:border-white hover:bg-white/10"
             >
                {muted ? <VolumeX className="text-white"/> : <Volume2 className="text-white"/>}
             </button>
        </div>

        {/* Info Area */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 px-10 py-8 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4 text-white">
            <div className="flex items-center gap-x-4 text-lg">
              <p className="font-semibold text-green-400">{movie.matchScore}% Match</p>
              <p className="font-light">{movie.year}</p>
              <div className="flex h-4 items-center justify-center rounded border border-white/40 px-1.5 text-xs font-bold">
                HD
              </div>
              <p className="font-light">{movie.duration}</p>
            </div>

            <p className="w-5/6 text-base font-light md:text-lg">
              {movie.description}
            </p>

            <hr className="bg-[#404040] border-0 h-px my-4" />
             
            {/* Analytics Demo with Recharts */}
            <div className="flex flex-col gap-2">
                 <h3 className="text-gray-400 text-sm uppercase">AI Compatibility Analysis</h3>
                 <div className="flex items-center gap-4">
                     <div className="w-16 h-16">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie
                                data={matchData}
                                cx="50%"
                                cy="50%"
                                innerRadius={15}
                                outerRadius={30}
                                fill="#8884d8"
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key="match" fill="#46d369" />
                                <Cell key="rest" fill="#333" />
                            </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                     </div>
                     <p className="text-sm text-gray-300">
                        Based on your viewing history, Gemini predicts a <span className="text-green-400 font-bold">{movie.matchScore}%</span> likelihood you will enjoy this title.
                     </p>
                 </div>
            </div>
          </div>

          <div className="space-y-4 text-sm text-white">
            <div>
              <span className="text-[gray]">Genres: </span>
              {movie.genre}
            </div>
            <div>
              <span className="text-[gray]">Original language: </span>
              English
            </div>
             <div>
              <span className="text-[gray]">Total votes: </span>
              {Math.floor(Math.random() * 5000) + 1000}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;