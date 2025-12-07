import React, { useState } from 'react';
import { Movie, User } from '../types';
import { Trash2, Plus, Film, LogOut, Eye, Users, Upload, Pencil, X, Image as ImageIcon, PauseCircle, PlayCircle, UserPlus, Settings, Type } from 'lucide-react';

interface AdminPanelProps {
  customMovies: { movie: Movie, category: string }[];
  allUsers: User[];
  onAddMovie: (movie: Movie, category: string) => void;
  onEditMovie: (movie: Movie, category: string) => void;
  onDeleteMovie: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onAddUser: (user: User) => void;
  onToggleUserStatus: (id: string) => void;
  onUpdateBackground: (url: string) => void;
  onLogout: () => void;
  onPreview: () => void;
  currentUser: User;
  currentBackgroundUrl: string;
  currentSubTitle: string;
  onUpdateSubTitle: (text: string) => void;
}

const CATEGORIES = ["Conferenze", "Pillole di storia", "Scavi archeologici", "Altri video"];

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    customMovies, 
    allUsers, 
    onAddMovie,
    onEditMovie,
    onDeleteMovie, 
    onDeleteUser,
    onAddUser,
    onToggleUserStatus,
    onUpdateBackground,
    onLogout, 
    onPreview,
    currentUser,
    currentBackgroundUrl,
    currentSubTitle,
    onUpdateSubTitle
}) => {
  const [activeTab, setActiveTab] = useState<'movies' | 'users' | 'settings'>('movies');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Movie Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    year: new Date().getFullYear(),
    duration: '',
    category: CATEGORIES[0]
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // User Form State
  const [userFormData, setUserFormData] = useState({
      name: '',
      surname: '',
      email: '',
      phone: '',
      username: '',
      password: ''
  });

  // Settings State
  const [bgPreview, setBgPreview] = useState<string>(currentBackgroundUrl);

  // --- MOVIE HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setVideoFile(e.target.files[0]);
      }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setThumbnailFile(e.target.files[0]);
      }
  };

  const startEditing = (movie: Movie, category: string) => {
    setEditingId(movie.id);
    setFormData({
        title: movie.title,
        description: movie.description,
        genre: movie.genre,
        year: movie.year,
        duration: movie.duration,
        category: category
    });
    setVideoFile(null); // Reset file inputs
    setThumbnailFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      genre: '',
      year: new Date().getFullYear(),
      duration: '',
      category: CATEGORIES[0]
    });
    setVideoFile(null);
    setThumbnailFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    // Create local URLs for the uploaded files
    const newVideoUrl = videoFile ? URL.createObjectURL(videoFile) : undefined;
    const newThumbnailUrl = thumbnailFile ? URL.createObjectURL(thumbnailFile) : undefined;

    if (editingId) {
        // Find original to keep its data if no new file provided
        const originalEntry = customMovies.find(m => m.movie.id === editingId);
        
        const finalVideoUrl = newVideoUrl || originalEntry?.movie.videoUrl;
        const finalThumbnailUrl = newThumbnailUrl || originalEntry?.movie.thumbnailUrl;

        const updatedMovie: Movie = {
            id: editingId,
            title: formData.title,
            description: formData.description,
            genre: formData.genre || 'General',
            year: Number(formData.year),
            duration: formData.duration || '10m',
            matchScore: originalEntry?.movie.matchScore || 99,
            videoUrl: finalVideoUrl,
            thumbnailUrl: finalThumbnailUrl,
            backdropUrl: finalThumbnailUrl // Use same image for backdrop
        };
        onEditMovie(updatedMovie, formData.category);
        setEditingId(null); // Exit edit mode
    } else {
        // Create Mode
        const newMovie: Movie = {
            id: `custom-${Date.now()}`,
            title: formData.title,
            description: formData.description,
            genre: formData.genre || 'General',
            year: Number(formData.year),
            duration: formData.duration || '10m',
            matchScore: 99,
            videoUrl: newVideoUrl,
            thumbnailUrl: newThumbnailUrl,
            backdropUrl: newThumbnailUrl
        };
        onAddMovie(newMovie, formData.category);
    }
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      genre: '',
      year: new Date().getFullYear(),
      duration: '',
      category: CATEGORIES[0]
    });
    setVideoFile(null);
    setThumbnailFile(null);
  };

  // --- USER HANDLERS ---
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setUserFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!userFormData.email || !userFormData.password || !userFormData.name) return;

      const newUser: User = {
          id: `u-admin-created-${Date.now()}`,
          name: userFormData.name,
          surname: userFormData.surname,
          email: userFormData.email,
          phone: userFormData.phone,
          username: userFormData.username || userFormData.email.split('@')[0],
          password: userFormData.password,
          role: 'user',
          myList: [],
          isPaused: false
      };

      onAddUser(newUser);

      // Reset User Form
      setUserFormData({
        name: '',
        surname: '',
        email: '',
        phone: '',
        username: '',
        password: ''
      });
  };

  // --- SETTINGS HANDLERS ---
  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        setBgPreview(url);
        onUpdateBackground(url);
    }
  };


  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans">
      {/* Admin Navbar */}
      <nav className="border-b border-gray-800 bg-black/90 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Film className="text-red-600 h-8 w-8" />
          <h1 className="text-2xl font-bold uppercase tracking-tighter">Archeoplay <span className="text-gray-400 text-sm normal-case font-normal ml-2">Admin Dashboard</span></h1>
        </div>
        <div className="flex gap-4">
             <button 
                onClick={onPreview}
                className="flex items-center gap-2 px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 transition"
             >
                <Eye size={18} />
                Preview Site
             </button>
            <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition"
            >
                <LogOut size={18} />
                Logout
            </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-8 pt-8 flex gap-4">
          <button 
            onClick={() => setActiveTab('movies')}
            className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'movies' ? 'bg-white text-black' : 'bg-[#333] text-white hover:bg-[#444]'}`}
          >
            Movies Library
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'users' ? 'bg-white text-black' : 'bg-[#333] text-white hover:bg-[#444]'}`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${activeTab === 'settings' ? 'bg-white text-black' : 'bg-[#333] text-white hover:bg-[#444]'}`}
          >
            <Settings size={18} /> Settings
          </button>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        
        {activeTab === 'movies' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload/Edit Form */}
                <div className="lg:col-span-1">
                <div className="bg-[#1f1f1f] rounded-lg p-6 sticky top-28 shadow-lg border border-gray-800/50">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            {editingId ? <Pencil className="text-blue-500" /> : <Plus className="text-green-500" />}
                            {editingId ? 'Edit Video' : 'Add New Video'}
                        </h2>
                        {editingId && (
                            <button onClick={cancelEditing} className="text-gray-400 hover:text-white text-xs flex items-center gap-1">
                                <X size={14}/> Cancel
                            </button>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Title</label>
                        <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full bg-[#333] border border-transparent focus:border-gray-500 rounded p-3 text-white outline-none transition"
                        placeholder="Video Title"
                        required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full bg-[#333] border border-transparent focus:border-gray-500 rounded p-3 text-white outline-none transition"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Genre</label>
                            <input
                            type="text"
                            name="genre"
                            value={formData.genre}
                            onChange={handleInputChange}
                            className="w-full bg-[#333] border border-transparent focus:border-gray-500 rounded p-3 text-white outline-none transition"
                            placeholder="History, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Year</label>
                            <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleInputChange}
                            className="w-full bg-[#333] border border-transparent focus:border-gray-500 rounded p-3 text-white outline-none transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Duration</label>
                        <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full bg-[#333] border border-transparent focus:border-gray-500 rounded p-3 text-white outline-none transition"
                        placeholder="e.g. 15m"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Description</label>
                        <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full bg-[#333] border border-transparent focus:border-gray-500 rounded p-3 text-white outline-none h-24 resize-none transition"
                        placeholder="Description..."
                        required
                        />
                    </div>

                    {/* Files Upload Area */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Video File */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">
                                {editingId ? "Replace Video" : "Video File"}
                            </label>
                            <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition ${editingId ? 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10' : 'border-gray-600 bg-[#2a2a2a] hover:bg-[#333]'}`}>
                                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                    <Upload className={`w-6 h-6 mb-1 ${editingId ? 'text-blue-400' : 'text-gray-400'}`} />
                                    <p className="text-[10px] text-gray-400 text-center px-1 truncate w-full">
                                        {videoFile ? videoFile.name : (editingId ? 'Replace MP4' : 'Upload MP4')}
                                    </p>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="video/*" 
                                    onChange={handleVideoFileChange} 
                                />
                            </label>
                        </div>

                        {/* Thumbnail File */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">
                                {editingId ? "Replace Cover" : "Cover Image"}
                            </label>
                            <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition ${editingId ? 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10' : 'border-gray-600 bg-[#2a2a2a] hover:bg-[#333]'}`}>
                                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                    <ImageIcon className={`w-6 h-6 mb-1 ${editingId ? 'text-blue-400' : 'text-gray-400'}`} />
                                    <p className="text-[10px] text-gray-400 text-center px-1 truncate w-full">
                                        {thumbnailFile ? thumbnailFile.name : (editingId ? 'Replace Img' : 'Upload Img')}
                                    </p>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleThumbnailFileChange} 
                                />
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`w-full font-bold py-3 rounded transition ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                    >
                        {editingId ? 'Update Content' : 'Upload Content'}
                    </button>
                    </form>
                </div>
                </div>

                {/* Content List */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-6">Uploaded Library</h2>
                    
                    {customMovies.length === 0 ? (
                        <div className="text-center py-20 bg-[#1f1f1f] rounded-lg border border-gray-800 text-gray-500">
                            <Film className="mx-auto h-12 w-12 mb-4 opacity-20" />
                            <p>No content uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="bg-[#1f1f1f] rounded-lg overflow-hidden border border-gray-800">
                            <table className="w-full text-left">
                                <thead className="bg-black/50 text-gray-400 text-xs uppercase">
                                    <tr>
                                        <th className="p-4">Title</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4 text-center">Files</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {customMovies.map(({ movie, category }) => (
                                        <tr key={movie.id} className={`transition ${editingId === movie.id ? 'bg-blue-900/20' : 'hover:bg-white/5'}`}>
                                            <td className="p-4 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-16 bg-gray-700 rounded overflow-hidden relative group">
                                                        <img 
                                                            src={movie.thumbnailUrl || `https://picsum.photos/seed/${movie.title.replace(/ /g,'')}/100/60`} 
                                                            className="w-full h-full object-cover" 
                                                            alt="thumb" 
                                                        />
                                                    </div>
                                                    {movie.title}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-400 text-sm">
                                                <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs">{category}</span>
                                            </td>
                                            <td className="p-4 text-center text-xs text-gray-400">
                                                <div className="flex flex-col gap-1 items-center">
                                                    {movie.videoUrl ? (
                                                        <span className="text-green-500 font-bold flex items-center justify-center gap-1">
                                                            <Film size={10}/> VID
                                                        </span>
                                                    ) : <span className="text-gray-600">-</span>}
                                                    {movie.thumbnailUrl ? (
                                                        <span className="text-blue-500 font-bold flex items-center justify-center gap-1">
                                                            <ImageIcon size={10}/> IMG
                                                        </span>
                                                    ) : <span className="text-gray-600">-</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => startEditing(movie, category)}
                                                        className="text-gray-500 hover:text-blue-500 p-2 hover:bg-blue-500/10 rounded transition"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => onDeleteMovie(movie.id)}
                                                        className="text-gray-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add User Form */}
                <div className="lg:col-span-1">
                    <div className="bg-[#1f1f1f] rounded-lg p-6 sticky top-28 shadow-lg border border-gray-800/50">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <UserPlus className="text-green-500" />
                                Add New User
                            </h2>
                        </div>
                        
                        <form onSubmit={handleUserSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Nome</label>
                                    <input type="text" name="name" value={userFormData.name} onChange={handleUserInputChange} className="w-full bg-[#333] border border-transparent focus:border-gray-500 rounded p-3 text-white outline-none" placeholder="Name" required />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Cognome</label>
                                    <input type="text" name="surname" value={userFormData.surname} onChange={handleUserInputChange} className="w-full bg-[#333] border border-transparent focus:border-gray-500 rounded p-3 text-white outline-none" placeholder="Surname" required />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Email</label>
                                <input type="email" name="email" value={userFormData.email} onChange={handleUserInputChange} className="w-full bg-[#333] border border-transparent focus:border-gray-500 rounded p-3 text-white outline-none" placeholder="user@email.com" required />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Telefono</label>
                                <input type="tel" name="phone" value={userFormData.phone} onChange={handleUserInputChange} className="w-full bg-[#333] border border-transparent focus:border-gray-500 rounded p-3 text-white outline-none" placeholder="+39..." required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">User</label>
                                    <input type="text" name="username" value={userFormData.username} onChange={handleUserInputChange} className="w-full bg-[#333] border border-transparent focus:border-gray-500 rounded p-3 text-white outline-none" placeholder="Username" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Password</label>
                                    <input type="text" name="password" value={userFormData.password} onChange={handleUserInputChange} className="w-full bg-[#333] border border-transparent focus:border-gray-500 rounded p-3 text-white outline-none" placeholder="1234..." required />
                                </div>
                            </div>

                            <button type="submit" className="w-full font-bold py-3 rounded bg-green-600 hover:bg-green-700 text-white transition">
                                Create User
                            </button>
                        </form>
                    </div>
                </div>

                {/* User List */}
                <div className="lg:col-span-2">
                     <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Users className="text-blue-500" />
                        Registered Users ({allUsers.length})
                    </h2>
                    
                    <div className="bg-[#1f1f1f] rounded-lg overflow-hidden border border-gray-800">
                        <table className="w-full text-left">
                            <thead className="bg-black/50 text-gray-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">Profile</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4">Details</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {allUsers.map((user) => (
                                    <tr key={user.id} className={`hover:bg-white/5 transition ${user.isPaused ? 'opacity-50' : ''}`}>
                                        <td className="p-4 font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                                                    {user.name.charAt(0)}{user.surname ? user.surname.charAt(0) : ''}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{user.name} {user.surname}</div>
                                                    <div className="text-xs text-gray-400">@{user.username || 'user'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            <div>{user.email}</div>
                                            <div className="text-xs text-gray-500">{user.phone || '-'}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${user.role === 'admin' ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                            {user.myList && user.myList.length > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">{user.myList.length} saves</div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {user.isPaused ? (
                                                <span className="text-orange-500 text-xs font-bold flex justify-center items-center gap-1">
                                                    <PauseCircle size={12}/> Suspended
                                                </span>
                                            ) : (
                                                <span className="text-green-500 text-xs font-bold flex justify-center items-center gap-1">
                                                    <PlayCircle size={12}/> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {user.id !== currentUser.id && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => onToggleUserStatus(user.id)}
                                                        className={`p-2 rounded transition ${user.isPaused ? 'text-green-500 hover:bg-green-500/10' : 'text-orange-500 hover:bg-orange-500/10'}`}
                                                        title={user.isPaused ? "Resume Access" : "Pause Access"}
                                                    >
                                                        {user.isPaused ? <PlayCircle size={18} /> : <PauseCircle size={18} />}
                                                    </button>
                                                    <button 
                                                        onClick={() => onDeleteUser(user.id)}
                                                        className="text-gray-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded transition"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-[#1f1f1f] rounded-lg p-6 shadow-lg border border-gray-800/50">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <ImageIcon className="text-purple-500" />
                        Login Screen Appearance
                    </h2>
                    
                    <div className="space-y-6">
                        <div>
                             <label className="block text-sm text-gray-300 mb-2">Current Background Preview</label>
                             <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-gray-700">
                                <img src={bgPreview} alt="Login Background" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                     <h1 className="text-red-600 text-xl font-bold uppercase tracking-tighter opacity-70">ARCHEOPLAY</h1>
                                </div>
                             </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-2">Upload New Image</label>
                             <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-[#2a2a2a] transition bg-[#1f1f1f]">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                    <p className="text-sm text-gray-400"><span className="font-semibold">Click to upload</span> high res image</p>
                                    <p className="text-xs text-gray-500">SVG, PNG, JPG (Recommended 1920x1080)</p>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleBgFileChange} 
                                />
                            </label>
                        </div>
                    </div>
                 </div>
                 
                 <div className="bg-[#1f1f1f] rounded-lg p-6 shadow-lg border border-gray-800/50">
                     <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Type className="text-yellow-500" />
                        Platform Content
                     </h2>
                     <div className="space-y-4">
                         <div>
                            <label className="block text-sm text-gray-300 mb-2">Platform Subtitle Text</label>
                            <p className="text-xs text-gray-500 mb-2">This text appears below the main navigation bar on the home page.</p>
                            <input 
                                type="text" 
                                value={currentSubTitle}
                                onChange={(e) => onUpdateSubTitle(e.target.value)}
                                className="w-full bg-[#333] border border-transparent focus:border-gray-500 rounded p-3 text-white outline-none"
                                placeholder="e.g. Sardegna Turistica piattaforma video tv"
                            />
                         </div>
                     </div>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;