const ctx = new AudioContext();
let audio = [];
let currentSource = null;
let isPlaying = false;
let pausedTime = {}; // Track paused time for each song
let currentSongIndex = -1;
let startTime = 0; // Track start time for current song
let animationFrameId = null;

const songPaths = [
  "./songs/Dil-Ibadat.mp3",
  "./songs/Khuda-Jaane.mp3",
  "./songs/Maula-Mere-Maula.mp3",
  "./songs/Tujhe-Sochta-Hoon.mp3",
  "./songs/Aasan_Nahin_Yahan.mp3",
  "./songs/Aashiqui_(The_Love_Theme).mp3",
  "./songs/Chahun_Main_Ya_Naa.mp3",
  "./songs/Meri Ashiqui.mp3",
  "./songs/Piay Aaye Na.mp3",
  "./songs/Sunn_Raha_Hai_(Male).mp3",
];

const songNames = [
  "Dil Ibadat",
  "Khuda Jaane",
  "Maula Mere Maula",
  "Tujhe Sochta Hoon",
  "Aasan Nahin Yahan",
  "Aashiqui (The Love Theme)",
  "Chahun Main Ya Naa",
  "Meri Ashiqui",
  "Piay Aaye Na",
  "Sunn Raha Hai (Male)",
];

const artistNames = [
  "-Krishnakumar Kunnath",
  "-KK & Shilpa Rao",
  "-Roop Kumar Rathod",
  "-KK & Pritam Chakraborty",
  "-Arijit Singh",
  "-Mithoon",
  "-Palak Muchhal & Arijit Singh",
  "-Palak Muchhal & Arijit Singh",
  "-Tulsi Kumar, KK",
  "-Ankit Tiwari",
];

// Fetch and decode all audio files
Promise.all(
  songPaths.map((path) =>
    fetch(path)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
  )
)
  .then((decodedAudios) => {
    audio = decodedAudios;
  })
  .catch((error) => {
    console.error("Error loading audio:", error);
  });

// Function to play a song
function playSong(index) {
  if (currentSongIndex !== index) {
    stopCurrentSong(); // Stop the current song if playing

    const playSound = ctx.createBufferSource();
    playSound.buffer = audio[index];
    playSound.connect(ctx.destination);
    playSound.start(0, pausedTime[index] || 0); // Start from paused time if available

    currentSource = playSound;
    currentSongIndex = index;
    isPlaying = true;
    // Calculate start time
    startTime = ctx.currentTime - (pausedTime[index] || 0); 

    // Update button text for the selected song
    updateButtonText(index, "Pause");

    // Update song title in the playbar
    const playBarSongTitle = document.querySelector(".playbar-song-title");
    const playBarArtistName = document.querySelector(".playbar-artist-name");
    playBarSongTitle.textContent = songNames[index];
    playBarArtistName.textContent = artistNames[index];

    // Update song duration display
  const songDurationElement = document.querySelector(".song-duration");
  songDurationElement.textContent = formatTime(audio[index].duration);

  // Start updating seek bar and song duration display
  updateSeekBar();

    // Reset button text for other songs
    for (let i = 0; i < songPaths.length; i++) {
      if (i !== index) {
        updateButtonText(i, "Play Now");
      }
    }
  } else {
    togglePauseResume(); // Toggle pause/resume for the current song
  }

  // Reset paused time for the previously played song
  for (let i = 0; i < songPaths.length; i++) {
    if (i !== index) {
      pausedTime[i] = 0; // Reset paused time to 0 for other songs
    }
  }
}

// Function to stop the currently playing song
function stopCurrentSong() {
  if (currentSource) {
    currentSource.stop();
    currentSource = null;
    isPlaying = false;
    pausedTime[currentSongIndex] = ctx.currentTime - startTime; // Store the paused time for the current song

    // Reset button text for the current song
    if (currentSongIndex !== -1) {
      updateButtonText(currentSongIndex, "Play Now");
      currentSongIndex = -1;
    }

    cancelAnimationFrame(animationFrameId); // Stop updating seek bar
  }
}

// Function to toggle pause/resume for the current song
function togglePauseResume() {
  if (isPlaying && currentSource) {
    currentSource.stop();
    isPlaying = false;
    pausedTime[currentSongIndex] = ctx.currentTime - startTime; // Store the paused time
    updateButtonText(currentSongIndex, "Resume");
    cancelAnimationFrame(animationFrameId); // Stop updating seek bar
  } else if (currentSongIndex !== -1) {
    const playSound = ctx.createBufferSource();
    playSound.buffer = audio[currentSongIndex];
    playSound.connect(ctx.destination);
    playSound.start(0, pausedTime[currentSongIndex] || 0); // Start from paused time if available

    currentSource = playSound;
    isPlaying = true;
    startTime = ctx.currentTime - (pausedTime[currentSongIndex] || 0); // Calculate start time
    updateButtonText(currentSongIndex, "Pause");

    // Start updating seek bar and song duration display
    updateSeekBar();
  }
}

// Function to update the seek bar and song duration display based on current playback
function updateSeekBar() {
  const songDurationElement = document.querySelector(".song-duration");
  const elapsedTime = ctx.currentTime - startTime;
  const formattedTime = formatTime(elapsedTime);

  songDurationElement.textContent = formattedTime;

  const progress = elapsedTime / audio[currentSongIndex].duration;
  const seekBarWidth = document.querySelector('.seekbar').clientWidth;
  const newPosition = progress * seekBarWidth;

  const circle = document.querySelector('.circle');
  circle.style.left = `${newPosition}px`;

  animationFrameId = requestAnimationFrame(updateSeekBar);

  if (progress >= 1) {
    stopCurrentSong();
  }
}

// Function to format time in minutes and seconds
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}:${formattedSeconds}`;
}

// Function to update button text and image based on playback state
function updateButtonText(index, text) {
  const playBtn = document.querySelector(`.play-btn.song${index + 1}`);

  if (playBtn) {
    playBtn.textContent = text;
  }
}

// Event listeners for play buttons on each song card
document.querySelectorAll(".play-btn").forEach((button, index) => {
  button.addEventListener("click", () => {
    playSong(index);
  });
});

// Event listener for pause/resume button in playBar
const playBarBtn = document.querySelector(".playBtn");
playBarBtn.addEventListener("click", () => {
  togglePauseResume(); // Toggle pause/resume for the current song
});

// Update song names and artists in the DOM
document.querySelectorAll(".song-card").forEach((card, index) => {
  card.querySelector(".song-name").textContent = songNames[index];
  card.querySelector(".artist-name").textContent = artistNames[index];
});
