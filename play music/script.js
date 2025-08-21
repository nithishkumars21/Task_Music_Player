class MusicPlayer {
    constructor() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.playPauseIcon = document.getElementById('playPauseIcon');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progress = document.getElementById('progress');
        this.progressHandle = document.getElementById('progressHandle');
        this.progressBar = document.querySelector('.progress-bar');
        this.currentTime = document.getElementById('currentTime');
        this.duration = document.getElementById('duration');
        this.songTitle = document.getElementById('songTitle');
        this.artistName = document.getElementById('artistName');
        this.albumImage = document.getElementById('albumImage');
        this.volumeBar = document.querySelector('.volume-bar');
        this.volumeProgress = document.getElementById('volumeProgress');
        this.volumeHandle = document.getElementById('volumeHandle');
        this.volumeValue = document.getElementById('volumeValue');
        this.autoplayBtn = document.getElementById('autoplayBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.playlist = document.getElementById('playlist');
        this.audioFileInput = document.getElementById('audioFileInput');
        
        this.songs = [];
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.isAutoplay = false;
        this.isShuffle = false;
        this.volume = 1;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDefaultSongs();
    }
    
    setupEventListeners() {
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
        // Previous/Next buttons
        this.prevBtn.addEventListener('click', () => this.previousSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        
        // Audio events
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioPlayer.addEventListener('ended', () => this.handleSongEnd());
        
        // Progress bar
        this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        this.progressHandle.addEventListener('mousedown', (e) => this.startProgressDrag(e));
        
        // Volume control
        this.volumeBar.addEventListener('click', (e) => this.setVolume(e));
        this.volumeHandle.addEventListener('mousedown', (e) => this.startVolumeDrag(e));
        
        // Feature buttons
        this.autoplayBtn.addEventListener('click', () => this.toggleAutoplay());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        
        // File input
        this.audioFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    loadDefaultSongs() {
        // Default playlist with sample data
        const defaultSongs = [
            { title: 'Sample Song 1', artist: 'Sample Artist', src: null },
            { title: 'Sample Song 2', artist: 'Sample Artist', src: null },
            { title: 'Sample Song 3', artist: 'Sample Artist', src: null }
        ];
        
        this.songs = defaultSongs;
        this.renderPlaylist();
        this.updateSongInfo();
    }
    
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            if (file.type.startsWith('audio/')) {
                const url = URL.createObjectURL(file);
                const song = {
                    title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                    artist: 'Unknown Artist',
                    src: url,
                    file: file
                };
                
                this.songs.push(song);
            }
        });
        
        this.renderPlaylist();
        
        // If no song is currently loaded, load the first uploaded song
        if (!this.audioPlayer.src && this.songs.some(song => song.src)) {
            this.currentSongIndex = this.songs.findIndex(song => song.src);
            this.loadCurrentSong();
        }
    }
    
    renderPlaylist() {
        this.playlist.innerHTML = '';
        
        this.songs.forEach((song, index) => {
            const item = document.createElement('div');
            item.className = `playlist-item ${index === this.currentSongIndex ? 'active' : ''}`;
            item.innerHTML = `
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            `;
            
            item.addEventListener('click', () => {
                this.currentSongIndex = index;
                this.loadCurrentSong();
                if (song.src) {
                    this.play();
                }
            });
            
            this.playlist.appendChild(item);
        });
    }
    
    loadCurrentSong() {
        const currentSong = this.songs[this.currentSongIndex];
        
        if (currentSong && currentSong.src) {
            this.audioPlayer.src = currentSong.src;
            this.updateSongInfo();
            this.renderPlaylist(); // Update active state
        } else {
            this.updateSongInfo();
            this.renderPlaylist();
        }
    }
    
    updateSongInfo() {
        const currentSong = this.songs[this.currentSongIndex] || {};
        this.songTitle.textContent = currentSong.title || 'No Song Selected';
        this.artistName.textContent = currentSong.artist || 'Unknown Artist';
    }
    
    togglePlayPause() {
        const currentSong = this.songs[this.currentSongIndex];
        
        if (!currentSong || !currentSong.src) {
            alert('Please select an audio file first');
            return;
        }
        
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        const currentSong = this.songs[this.currentSongIndex];
        
        if (!currentSong || !currentSong.src) {
            return;
        }
        
        this.audioPlayer.play().then(() => {
            this.isPlaying = true;
            this.playPauseIcon.textContent = '⏸';
            this.albumImage.classList.add('playing');
        }).catch(error => {
            console.error('Error playing audio:', error);
        });
    }
    
    pause() {
        this.audioPlayer.pause();
        this.isPlaying = false;
        this.playPauseIcon.textContent = '▶';
        this.albumImage.classList.remove('playing');
    }
    
    previousSong() {
        if (this.isShuffle) {
            this.currentSongIndex = Math.floor(Math.random() * this.songs.length);
        } else {
            this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        }
        
        this.loadCurrentSong();
        if (this.isPlaying) {
            this.play();
        }
    }
    
    nextSong() {
        if (this.isShuffle) {
            this.currentSongIndex = Math.floor(Math.random() * this.songs.length);
        } else {
            this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        }
        
        this.loadCurrentSong();
        if (this.isPlaying) {
            this.play();
        }
    }
    
    handleSongEnd() {
        this.isPlaying = false;
        this.playPauseIcon.textContent = '▶';
        this.albumImage.classList.remove('playing');
        
        if (this.isAutoplay) {
            setTimeout(() => {
                this.nextSong();
            }, 500);
        }
    }
    
    updateProgress() {
        if (this.audioPlayer.duration) {
            const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            this.progress.style.width = `${progress}%`;
            this.progressHandle.style.left = `${progress}%`;
            this.currentTime.textContent = this.formatTime(this.audioPlayer.currentTime);
        }
    }
    
    updateDuration() {
        if (this.audioPlayer.duration) {
            this.duration.textContent = this.formatTime(this.audioPlayer.duration);
        }
    }
    
    seekTo(event) {
        if (!this.audioPlayer.duration) return;
        
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        const seekTime = percent * this.audioPlayer.duration;
        
        this.audioPlayer.currentTime = seekTime;
    }
    
    startProgressDrag(event) {
        event.preventDefault();
        
        const handleDrag = (e) => {
            const rect = this.progressBar.getBoundingClientRect();
            let percent = (e.clientX - rect.left) / rect.width;
            percent = Math.max(0, Math.min(1, percent));
            
            if (this.audioPlayer.duration) {
                this.audioPlayer.currentTime = percent * this.audioPlayer.duration;
            }
        };
        
        const stopDrag = () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', stopDrag);
        };
        
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
    }
    
    setVolume(event) {
        const rect = this.volumeBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        
        this.volume = Math.max(0, Math.min(1, percent));
        this.audioPlayer.volume = this.volume;
        this.updateVolumeDisplay();
    }
    
    startVolumeDrag(event) {
        event.preventDefault();
        
        const handleDrag = (e) => {
            const rect = this.volumeBar.getBoundingClientRect();
            let percent = (e.clientX - rect.left) / rect.width;
            percent = Math.max(0, Math.min(1, percent));
            
            this.volume = percent;
            this.audioPlayer.volume = this.volume;
            this.updateVolumeDisplay();
        };
        
        const stopDrag = () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', stopDrag);
        };
        
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
    }
    
    updateVolumeDisplay() {
        const percent = this.volume * 100;
        this.volumeProgress.style.width = `${percent}%`;
        this.volumeHandle.style.right = `${100 - percent}%`;
        this.volumeValue.textContent = Math.round(percent);
    }
    
    toggleAutoplay() {
        this.isAutoplay = !this.isAutoplay;
        this.autoplayBtn.classList.toggle('active', this.isAutoplay);
    }
    
    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.shuffleBtn.classList.toggle('active', this.isShuffle);
    }
    
    handleKeyPress(event) {
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                this.previousSong();
                break;
            case 'ArrowRight':
                this.nextSong();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.volume = Math.min(1, this.volume + 0.1);
                this.audioPlayer.volume = this.volume;
                this.updateVolumeDisplay();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.volume = Math.max(0, this.volume - 0.1);
                this.audioPlayer.volume = this.volume;
                this.updateVolumeDisplay();
                break;
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Initialize the music player when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});