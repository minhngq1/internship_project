const songs = [
  {
    title: "Song 1",
    artist: "Clone 1",
    src: "assets/music/song1.mp3",
    cover: "assets/music/cover/lisa.jpg"
  },
  {
    title: "Song 2",
    artist: "Clone 2",
    src: "assets/music/song2.mp3",
    cover: "assets/music/cover/sontung.jpg"
  },
  {
    title: "Song 3",
    artist: "Clone 3",
    src: "assets/music/song3.mp3",
    cover: "assets/music/cover/tải xuống (1).jpg"
  }
];

const playlist = document.getElementById('playlist');
const audio = document.getElementById('audio');
const cover = document.getElementById('cover');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const playpause = document.getElementById('playpause');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const progress = document.getElementById('progress');
const repeatBtn = document.getElementById('repeat');
const volumeInput = document.getElementById('volume');
const searchInput = document.querySelector('.search');
const homeBtn = document.querySelector('.sidebar li.active');
const searchBtn = document.querySelector('.sidebar li:nth-child(2)');
const yourMusicBtn = document.querySelector('.sidebar li:nth-child(3)');

let current = 0;
let isPlaying = false;
let isRepeat = false;
let savedSongs = JSON.parse(localStorage.getItem('savedSongs') || '[]');

function renderPlaylist(list = songs) {
  playlist.innerHTML = '';
  list.forEach((song, idx) => {
    const isSaved = savedSongs.includes(idx);
    const heartClass = isSaved ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    const heartColor = isSaved ? '#e74c3c' : '';
    const div = document.createElement('div');
    div.className = 'song';
    div.innerHTML = `
      <img src="${song.cover}" alt="cover">
      <div class="song-title">${song.title}</div>
      <div class="song-artist">${song.artist}</div>
      <button class="save-btn" data-idx="${idx}" title="Yêu thích">
        <i class="${heartClass}" style="color:${heartColor}"></i>
      </button>
    `;
    div.onclick = (e) => {
      if (e.target.classList.contains('save-btn') || e.target.closest('.save-btn')) return;
      playSong(idx);
    };
    const saveBtn = div.querySelector('.save-btn');
    saveBtn.onclick = (e) => {
      e.stopPropagation();
      if (!savedSongs.includes(idx)) {
        savedSongs.push(idx);
      } else {
        savedSongs = savedSongs.filter(i => i !== idx);
      }
      localStorage.setItem('savedSongs', JSON.stringify(savedSongs));
      renderPlaylist(list);
    };
    playlist.appendChild(div);
  });
}

function playSong(idx) {
  current = idx;
  const song = songs[idx];
  audio.src = song.src;
  cover.src = song.cover;
  title.textContent = song.title;
  artist.textContent = song.artist;
  audio.play();
  isPlaying = true;
  playpause.innerHTML = '<i class="fa fa-pause"></i>';
}

function playPause() {
  if (isPlaying) {
    audio.pause();
    playpause.innerHTML = '<i class="fa fa-play"></i>';
  } else {
    audio.play();
    playpause.innerHTML = '<i class="fa fa-pause"></i>';
  }
  isPlaying = !isPlaying;
}

function playNext() {
  current = (current + 1) % songs.length;
  playSong(current);
}

function playPrev() {
  current = (current - 1 + songs.length) % songs.length;
  playSong(current);
}

progress.addEventListener('input', function () {
  const percent = this.value / 100;
  audio.currentTime = percent * audio.duration;
});
audio.addEventListener('timeupdate', function () {
  if (audio.duration) {
    progress.value = (audio.currentTime / audio.duration) * 100;
  }
});

volumeInput.addEventListener('input', function () {
  audio.volume = this.value / 100;
});

repeatBtn.addEventListener('click', function () {
  isRepeat = !isRepeat;
  repeatBtn.style.color = isRepeat ? '#1db954' : '#fff';
});
audio.addEventListener('ended', function () {
  if (isRepeat) {
    audio.currentTime = 0;
    audio.play();
  } else {
    playNext();
  }
});

searchInput.addEventListener('input', function () {
  const keyword = this.value.toLowerCase();
  const filtered = songs.filter(song =>
    song.title.toLowerCase().includes(keyword) ||
    song.artist.toLowerCase().includes(keyword)
  );
  renderPlaylist(filtered);
});

homeBtn.addEventListener('click', function () {
  renderPlaylist();
  searchInput.value = '';
});

searchBtn.addEventListener('click', function () {
  searchInput.focus();
});

yourMusicBtn.addEventListener('click', function () {
  const list = savedSongs.map(idx => songs[idx]);
  renderPlaylist(list.length ? list : []);
  searchInput.value = '';
});

playpause.onclick = playPause;
next.onclick = playNext;
prev.onclick = playPrev;

window.onload = () => {
  renderPlaylist();
  playSong(0);
};