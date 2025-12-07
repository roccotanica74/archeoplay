import React, { useEffect, useState } from 'react';
import { Search, Bell, Menu, User as UserIcon, Settings } from 'lucide-react';
import Auth from './components/Auth';
import Row from './components/Row';
import Modal from './components/Modal';
import VideoPlayer from './components/VideoPlayer';
import AdminPanel from './components/AdminPanel';
import { fetchMoviesWithGemini, searchMoviesWithGemini } from './services/geminiService';
import { Category, Movie, User, AppView } from './types';

// Initial Mock Users
const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    email: 'admin',
    username: 'admin',
    password: '12345',
    name: 'Main',
    surname: 'Administrator',
    role: 'admin',
    isPaused: false,
    myList: []
  },
  {
    id: 'u-test',
    email: 'test@gmail.com',
    username: 'testuser',
    password: '12345678',
    name: 'Test',
    surname: 'User',
    phone: '123-456-7890',
    role: 'user',
    isPaused: false,
    myList: []
  }
];

function App() {
  // Global State
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [view, setView] = useState<AppView>('auth');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Custom/Admin uploaded movies state. Stored with category reference to merge later.
  const [customMovies, setCustomMovies] = useState<{ movie: Movie, category: string }[]>([]);
  
  // Auth Background State (Default Archaeology Image - Colosseum Rome)
  const [authBackgroundUrl, setAuthBackgroundUrl] = useState<string>("https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1996&auto=format&fit=crop");
  
  // Platform Subtitle State
  const [platformSubTitle, setPlatformSubTitle] = useState("Sardegna Turistica piattaforma video tv");

  // Modal State
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);

  // Initialize data on login
  useEffect(() => {
    if (currentUser) {
      // Fetch initial data
      const loadContent = async () => {
        const aiData = await fetchMoviesWithGemini();
        
        // Merge custom movies into the fetched categories
        const mergedCategories = aiData.map(cat => {
            const extraMovies = customMovies
                .filter(cm => cm.category === cat.title)
                .map(cm => cm.movie);
            return {
                ...cat,
                movies: [...extraMovies, ...cat.movies]
            };
        });

        setCategories(mergedCategories);

        // Set featured movie from custom movies if available, else from AI data
        if (customMovies.length > 0) {
            setFeaturedMovie(customMovies[customMovies.length - 1].movie);
        } else if (aiData.length > 0 && aiData[0].movies.length > 0) {
            setFeaturedMovie(aiData[0].movies[0]);
        }
      };
      loadContent();
    }
  }, [currentUser, customMovies]); // Re-run if customMovies changes

  // Handle scroll for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
        if (searchQuery.length > 2) {
            const results = await searchMoviesWithGemini(searchQuery);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- USER ACTIONS ---

  const handleRegister = (newUser: User) => {
    setAllUsers([...allUsers, newUser]);
    setCurrentUser(newUser);
    setView('browse');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
        setView('admin');
    } else {
        setView('browse');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('auth');
    setCategories([]);
    setFeaturedMovie(null);
  };

  const handleToggleMyList = (movie: Movie) => {
    if (!currentUser) return;

    const isInList = currentUser.myList.some(m => m.id === movie.id);
    let updatedList;
    
    if (isInList) {
        updatedList = currentUser.myList.filter(m => m.id !== movie.id);
    } else {
        updatedList = [...currentUser.myList, movie];
    }

    // Update current user state
    const updatedUser = { ...currentUser, myList: updatedList };
    setCurrentUser(updatedUser);

    // Update global users state to persist changes
    setAllUsers(allUsers.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  // --- ADMIN ACTIONS ---

  const handleAdminAddMovie = (movie: Movie, category: string) => {
      setCustomMovies(prev => [...prev, { movie, category }]);
  };

  const handleAdminEditMovie = (updatedMovie: Movie, category: string) => {
    setCustomMovies(prev => prev.map(item => 
        item.movie.id === updatedMovie.id 
        ? { movie: updatedMovie, category } 
        : item
    ));
  };

  const handleAdminDeleteMovie = (id: string) => {
      setCustomMovies(prev => prev.filter(m => m.movie.id !== id));
  };

  const handleAdminDeleteUser = (userId: string) => {
      setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleAdminAddUser = (newUser: User) => {
      setAllUsers(prev => [...prev, newUser]);
  };

  const handleAdminToggleUserStatus = (userId: string) => {
      setAllUsers(prev => prev.map(u => {
          if (u.id === userId) {
              return { ...u, isPaused: !u.isPaused };
          }
          return u;
      }));
  };
  
  const handleAdminUpdateBackground = (url: string) => {
      setAuthBackgroundUrl(url);
  };

  const handleAdminUpdateSubTitle = (text: string) => {
      setPlatformSubTitle(text);
  };

  // --- VIEW RENDERING ---

  if (view === 'auth') {
    return <Auth 
        onLogin={handleLogin} 
        onRegister={handleRegister} 
        existingUsers={allUsers} 
        backgroundImageUrl={authBackgroundUrl}
    />;
  }

  if (view === 'admin') {
      return (
        <AdminPanel 
            customMovies={customMovies}
            allUsers={allUsers}
            onAddMovie={handleAdminAddMovie}
            onEditMovie={handleAdminEditMovie}
            onDeleteMovie={handleAdminDeleteMovie}
            onDeleteUser={handleAdminDeleteUser}
            onAddUser={handleAdminAddUser}
            onToggleUserStatus={handleAdminToggleUserStatus}
            onUpdateBackground={handleAdminUpdateBackground}
            onLogout={handleLogout}
            onPreview={() => setView('browse')}
            currentUser={currentUser!}
            currentBackgroundUrl={authBackgroundUrl}
            currentSubTitle={platformSubTitle}
            onUpdateSubTitle={handleAdminUpdateSubTitle}
        />
      );
  }

  if (view === 'watch') {
      return <VideoPlayer 
        title={selectedMovie?.title || "Video"} 
        onBack={() => setView('browse')} 
        videoUrl={selectedMovie?.videoUrl}
      />;
  }

  // Browse View
  return (
    <div className="relative min-h-screen bg-[#141414] pb-20">
      {/* Navbar */}
      <header className={`fixed top-0 z-50 flex flex-col w-full transition-all ${isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="flex items-center justify-between px-4 py-3 lg:px-10 lg:py-4">
            <div className="flex items-center space-x-2 md:space-x-8">
            <h1 className="cursor-pointer text-2xl font-bold text-[#e50914] md:text-3xl" onClick={() => { setIsSearching(false); setSearchQuery(''); }}>
                ARCHEOPLAY
            </h1>
            <ul className="hidden space-x-4 md:flex text-sm font-light text-[#e5e5e5]">
                <li className="cursor-pointer font-bold transition hover:text-[#b3b3b3]">Home</li>
                <li className="cursor-pointer transition hover:text-[#b3b3b3]">Conferenze</li>
                <li className="cursor-pointer transition hover:text-[#b3b3b3]">Storia</li>
                <li className="cursor-pointer transition hover:text-[#b3b3b3]">Archeologia</li>
                <li className="cursor-pointer transition hover:text-[#b3b3b3]">Altri video</li>
                <li className="cursor-pointer transition hover:text-[#b3b3b3]">La mia lista</li>
            </ul>
            </div>

            <div className="flex items-center space-x-4 text-sm font-light">
            <div className={`flex items-center border border-white/0 p-1 transition-all ${isSearching ? 'border-white/100 bg-black' : ''}`}>
                <Search className="h-6 w-6 cursor-pointer text-white" onClick={() => setIsSearching(!isSearching)} />
                {isSearching && (
                    <input 
                        type="text" 
                        placeholder="Cerca titoli..." 
                        className="ml-2 bg-transparent text-white outline-none w-20 sm:w-60 transition-all"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                )}
            </div>
            <Bell className="h-6 w-6 cursor-pointer hidden sm:block" />
            
            <div className="flex items-center gap-2">
                {/* Admin Return Button (if logged in as admin but viewing site) */}
                {currentUser?.role === 'admin' && (
                    <button 
                        onClick={() => setView('admin')}
                        className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition"
                        title="Return to Admin Panel"
                    >
                        <Settings className="w-4 h-4 text-white" />
                    </button>
                )}

                <div className="flex items-center cursor-pointer group relative" onClick={handleLogout}>
                    <div className="h-8 w-8 rounded bg-yellow-500 flex items-center justify-center font-bold text-black">
                        {currentUser?.name[0].toUpperCase()}
                    </div>
                    <p className="hidden ml-2 sm:block text-xs group-hover:underline">Esci</p>
                </div>
            </div>
            </div>
        </div>
        {/* Subtitle Banner - Aligned Left under Logo */}
        <div className="w-full text-left pl-4 lg:pl-10 pb-2">
             <p className="text-[#e5e5e5] text-xs md:text-sm font-serif italic tracking-wider opacity-90 drop-shadow-md">
                {platformSubTitle}
             </p>
        </div>
      </header>

      <main className="relative">
        {/* Search Results Overlay */}
        {isSearching && searchQuery.length > 0 ? (
            <div className="pt-24 px-4 md:px-10 min-h-screen bg-[#141414]">
                <h2 className="text-xl font-bold mb-4 text-[#e5e5e5]">Risultati per "{searchQuery}"</h2>
                {searchResults.length === 0 ? (
                    <p className="text-gray-400">Ricerca nel database globale con Gemini...</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {searchResults.map(movie => (
                             <div 
                                key={movie.id} 
                                className="relative aspect-video bg-[#2f2f2f] cursor-pointer hover:scale-105 transition rounded overflow-hidden"
                                onClick={() => setSelectedMovie(movie)}
                             >
                                <img 
                                    src={`https://picsum.photos/seed/${movie.title.replace(/ /g,'')}/400/225`} 
                                    className="w-full h-full object-cover" 
                                    alt="movie.title"
                                />
                                <div className="absolute bottom-0 w-full bg-black/60 p-2">
                                    <p className="text-xs font-bold truncate">{movie.title}</p>
                                </div>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            <>
                {/* Hero Banner */}
                {featuredMovie && (
                <div className="flex flex-col space-y-2 py-16 md:space-y-4 h-[50vh] md:h-[85vh] justify-end pb-12 lg:pb-24 relative">
                    <div className="absolute top-0 left-0 -z-10 h-[95vh] w-full">
                    <img
                        src={featuredMovie.backdropUrl || featuredMovie.thumbnailUrl || `https://picsum.photos/seed/${featuredMovie.title.replace(/ /g,'')}/1920/1080`}
                        alt="banner"
                        className="h-full w-full object-cover"
                    />
                     <div className="absolute bottom-0 h-48 w-full bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
                     <div className="absolute top-0 h-full w-full bg-black/20" />
                    </div>

                    <div className="pl-4 md:pl-10 space-y-4 lg:space-y-6 max-w-2xl">
                        <h1 className="text-2xl font-bold md:text-4xl lg:text-7xl drop-shadow-xl">
                            {featuredMovie.title}
                        </h1>
                        <p className="max-w-xs text-xs text-shadow-md md:max-w-lg md:text-lg lg:max-w-2xl lg:text-2xl drop-shadow-md">
                            {featuredMovie.description}
                        </p>
                        <div className="flex space-x-3">
                            <button 
                                onClick={() => { setSelectedMovie(featuredMovie); setView('watch'); }}
                                className="flex items-center gap-x-2 rounded bg-white px-5 py-1.5 text-sm font-bold text-black transition hover:bg-[#e6e6e6] md:py-2.5 md:px-8 md:text-xl"
                            >
                                <div className="h-5 w-5 md:h-7 md:w-7 bg-black mask-play" style={{clipPath: 'polygon(0 0, 100% 50%, 0 100%)'}}></div>
                                Riproduci
                            </button>
                            <button 
                                onClick={() => setSelectedMovie(featuredMovie)}
                                className="flex items-center gap-x-2 rounded bg-[gray]/70 px-5 py-1.5 text-sm font-bold text-white transition hover:bg-[gray]/40 md:py-2.5 md:px-8 md:text-xl"
                            >
                                Altre Info
                            </button>
                        </div>
                    </div>
                </div>
                )}

                {/* Rows */}
                <section className="md:space-y-24">
                {/* My List Row */}
                {currentUser?.myList && currentUser.myList.length > 0 && (
                     <Row 
                        title="La mia lista" 
                        movies={currentUser.myList} 
                        onMovieClick={setSelectedMovie}
                    />
                )}

                {categories.map((category) => (
                    <Row 
                        key={category.title} 
                        title={category.title} 
                        movies={category.movies} 
                        onMovieClick={setSelectedMovie}
                    />
                ))}
                
                {categories.length === 0 && (
                    <div className="flex items-center justify-center h-40 text-gray-500">
                        Loading AI curated content...
                    </div>
                )}
                </section>
            </>
        )}
      </main>

      {/* Modal */}
      {selectedMovie && (
        <Modal 
            movie={selectedMovie} 
            onClose={() => setSelectedMovie(null)} 
            onPlay={() => setView('watch')}
            onToggleMyList={handleToggleMyList}
            isInMyList={currentUser?.myList.some(m => m.id === selectedMovie.id) || false}
        />
      )}
    </div>
  );
}

export default App;