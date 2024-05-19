const ctx = new AudioContext();
let audio = [];
let currentSource = null;
let isPlaying = false;
let pausedTime = {}; // Track paused time for each song
let currentSongIndex = -1;
let startTime = 0; // Track start time for current song
let animationFrameId = null;
let isSeeking = false; // Flag to track if user is seeking
let isDragging = false; // Flag to check if dragging is happening

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
      .catch((error) => {
        console.error(`Error loading audio file ${path}:`, error);
        return null; // Return null if an error occurs
      })
  )
)
  .then((decodedAudios) => {
    audio = decodedAudios.filter(Boolean); // Filter out any null values
  })
  .catch((error) => {
    console.error("Error loading audio files:", error);
  });

// Function to play a song
function playSong(index) {
  if (audio[index]) {
    if (currentSongIndex !== index || !isPlaying) {
      stopCurrentSong(); // Stop the current song if playing

      const playSound = ctx.createBufferSource();
      playSound.buffer = audio[index];
      playSound.connect(ctx.destination);
      playSound.start(0, pausedTime[index] || 0); // Start from paused time if available

      currentSource = playSound;
      currentSongIndex = index;
      isPlaying = true;
      startTime = ctx.currentTime - (pausedTime[index] || 0);

      updateButtonText(index, "Pause");
      updatePlayBar(index);

      resetOtherButtons(index);

      updateSeekBar();
    } else {
      togglePauseResume(); // Toggle pause/resume for the current song
    }

    resetPausedTime(index);
  }
}

// Function to stop the currently playing song
function stopCurrentSong() {
  if (currentSource) {
    currentSource.stop();
    currentSource = null;
    isPlaying = false;
    pausedTime[currentSongIndex] = ctx.currentTime - startTime; // Store the pause time for the current song

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
    pausedTime[currentSongIndex] = ctx.currentTime - startTime; // Store the pause time
    updateButtonText(currentSongIndex, "Resume");
    cancelAnimationFrame(animationFrameId); // Stop updating seek bar
  } else if (currentSongIndex !== -1) {
    const playSound = ctx.createBufferSource();
    playSound.buffer = audio[currentSongIndex];
    playSound.connect(ctx.destination);
    playSound.start(0, pausedTime[currentSongIndex] || 0); // Start from pause time if available

    currentSource = playSound;
    isPlaying = true;
    startTime = ctx.currentTime - (pausedTime[currentSongIndex] || 0); // Calculate the start time
    updateButtonText(currentSongIndex, "Pause");

    // Start updating the seek bar and song duration display
    updateSeekBar();
  }
}

// Function to update the seek bar and song duration display
function updateSeekBar() {
  if (!isDragging && isPlaying) {
    const songDurationElement = document.querySelector(".song-duration");
    const elapsedTime = ctx.currentTime - startTime;
    const formattedTime = formatTime(elapsedTime);

    songDurationElement.textContent = formattedTime;

    const progress = elapsedTime / audio[currentSongIndex].duration;
    const seekBarWidth = document.querySelector(".seekbar").clientWidth;
    const newPosition = progress * seekBarWidth;

    const circle = document.querySelector(".circle");
    circle.style.left = `${progress * 100}%`;

    animationFrameId = requestAnimationFrame(updateSeekBar);

    if (progress >= 1) {
      stopCurrentSong();
    }
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

// Function to update the play bar with song information
function updatePlayBar(index) {
  const playBarSongTitle = document.querySelector(".playbar-song-title");
  const playBarArtistName = document.querySelector(".playbar-artist-name");
  playBarSongTitle.textContent = songNames[index];
  playBarArtistName.textContent = artistNames[index];

  const songDurationElement = document.querySelector(".song-duration");
  const songTotalTime = document.querySelector(".total-time");
  songDurationElement.textContent = formatTime(audio[index].duration);
  songTotalTime.textContent = formatTime(audio[index].duration);
}

// Function to reset button text for all other songs
function resetOtherButtons(index) {
  for (let i = 0; i < songPaths.length; i++) {
    if (i !== index) {
      updateButtonText(i, "Play Now");
    }
  }
}

// Function to reset paused time for all other songs
function resetPausedTime(index) {
  for (let i = 0; i < songPaths.length; i++) {
    if (i !== index) {
      pausedTime[i] = 0;
    }
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
playBarBtn.addEventListener("click", togglePauseResume);

// Update song names and artists in the DOM
document.querySelectorAll(".song-card").forEach((card, index) => {
  card.querySelector(".song-name").textContent = songNames[index];
  card.querySelector(".artist-name").textContent = artistNames[index];
});

// Function to handle hover effect
function addHoverEffect(iconClass, textClass) {
  const icon = document.querySelector(`.${iconClass}`);
  const text = document.querySelector(`.${textClass}`);

  icon.addEventListener("mouseover", () => {
    text.style.opacity = "1";
  });

  icon.addEventListener("mouseout", () => {
    text.style.opacity = "0";
  });
}

// Apply hover effects
addHoverEffect("mic", "Lyrics");
addHoverEffect("bars", "Queue");
addHoverEffect("plug", "Connect");

// // Optional: Add click/drag event listeners for seek bar to allow user seeking
document.querySelector(".seekbar").addEventListener("click", (event) => {
  if (currentSongIndex !== -1) {
    const seekBarWidth = event.target.clientWidth;
    const clickPosition = event.offsetX;
    const seekTime =
      (clickPosition / seekBarWidth) * audio[currentSongIndex].duration;
    pausedTime[currentSongIndex] = seekTime;
    startTime = ctx.currentTime - seekTime;
    if (isPlaying) {
      playSong(currentSongIndex);
    }
  }
});

// Function to handle seeking when clicking on seekbar
function seek(event) {
  if (currentSongIndex !== -1) {
    const seekBar = document.querySelector(".seekbar");
    const seekBarRect = seekBar.getBoundingClientRect();
    const seekBarWidth = seekBarRect.width;
    const clickPosition = event.clientX - seekBarRect.left;
    const seekTime =
      (clickPosition / seekBarWidth) * audio[currentSongIndex].duration;
    pausedTime[currentSongIndex] = seekTime;
    startTime = ctx.currentTime - seekTime;
    if (isPlaying) {
      playSong(currentSongIndex);
    } else {
      updateSeekBar(); // Update seek bar position when not playing
    }
  }
}

// Function to handle dragging the circle
function startDragging(event) {
  event.preventDefault();
  isDragging = true;
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDragging);
}

function drag(event) {
  const seekBar = document.querySelector(".seekbar");
  const seekBarRect = seekBar.getBoundingClientRect();
  const seekBarWidth = seekBarRect.width;
  const clickPosition = event.clientX - seekBarRect.left;
  const progress = clickPosition / seekBarWidth;

  if (currentSongIndex !== -1) {
    const seekTime = progress * audio[currentSongIndex].duration;
    pausedTime[currentSongIndex] = seekTime;
    startTime = ctx.currentTime - seekTime;

    const circle = document.querySelector(".circle");
    circle.style.left = `${progress * 100}%`;

    const songDurationElement = document.querySelector(".song-duration");
    songDurationElement.textContent = formatTime(seekTime);
  }
}

// Function to handle stopping the drag
function stopDragging(event) {
  isDragging = false;
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", stopDragging);

  if (isPlaying && currentSongIndex !== -1) {
    playSong(currentSongIndex);
  } else {
    updateSeekBar(); // Update seek bar position when not playing
  }
}

// Adding event listener to the circle for dragging
const circle = document.querySelector(".circle");
circle.addEventListener("mousedown", startDragging);

// Adding event listener to the seekbar for clicking  
const seekBar = document.querySelector(".seekbar");
seekBar.addEventListener("click", seek);
