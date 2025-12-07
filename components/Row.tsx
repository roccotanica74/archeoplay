import React, { useRef, useState } from 'react';
import { Movie } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RowProps {
  title: string;
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  isLarge?: boolean;
}

const Row: React.FC<RowProps> = ({ title, movies, onMovieClick, isLarge = false }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);

  const handleClick = (direction: 'left' | 'right') => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="h-40 space-y-0.5 md:space-y-2 mb-8 md:mb-12">
      <h2 className="w-56 cursor-pointer text-sm font-semibold text-[#e5e5e5] transition duration-200 hover:text-white md:text-2xl lg:text-xl pl-4 md:pl-10">
        {title}
      </h2>
      <div className="group relative md:-ml-2">
        <ChevronLeft
          className={`absolute bottom-0 top-0 left-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 ${!isMoved && 'hidden'}`}
          onClick={() => handleClick('left')}
        />
        
        <div
          ref={rowRef}
          className="flex items-center space-x-2.5 overflow-x-scroll scrollbar-hide md:space-x-3.5 md:p-2 pl-4 md:pl-10 no-scrollbar"
        >
          {movies.map((movie) => {
             // Generate a deterministic image URL based on ID
             const seed = movie.id.replace(/\D/g, '') || movie.title.length;
             const isPortrait = isLarge;
             const width = isPortrait ? 300 : 500;
             const height = isPortrait ? 450 : 281; // 16:9 ratio approx
             const imageUrl = movie.thumbnailUrl || `https://picsum.photos/seed/${movie.title.replace(/ /g,'')}${seed}/${width}/${height}`;

             return (
              <div
                key={movie.id}
                className={`relative h-28 min-w-[180px] cursor-pointer transition duration-200 ease-out md:h-36 md:min-w-[260px] md:hover:scale-105`}
                onClick={() => onMovieClick(movie)}
              >
                <img
                  src={imageUrl}
                  alt={movie.title}
                  className="rounded-sm object-cover md:rounded w-full h-full"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end">
                    <p className="text-xs font-bold text-white">{movie.title}</p>
                    <p className="text-[10px] text-green-400">{movie.matchScore}% Match</p>
                </div>
              </div>
             );
          })}
        </div>

        <ChevronRight
          className="absolute bottom-0 top-0 right-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100"
          onClick={() => handleClick('right')}
        />
      </div>
    </div>
  );
};

export default Row;
