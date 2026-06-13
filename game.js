// Game variables
var buttonColours = ["red", "blue", "green", "yellow"];
var gamePattern = [];
var userClickedPattern = [];
var started = false;
var level = 0;
var bestScore = 0;
var streak = 0;
var allowClick = true;
var specialEffects = true;

// Difficulty settings
var currentDifficulty = "normal";
var sequenceDelay = 500;

var difficultySettings = {
  easy: { speed: 800, name: "EASY" },
  normal: { speed: 500, name: "NORMAL" },
  hard: { speed: 300, name: "HARD" },
  extreme: { speed: 150, name: "EXTREME" }
};

// Load best score
if (localStorage.getItem("simonBestScore")) {
  bestScore = parseInt(localStorage.getItem("simonBestScore"));
  $("#best").text(bestScore);
}

// Start game
$(document).keypress(function(e) {
  if (!started && e.key !== 'm' && e.key !== 'M' && e.key !== 's' && e.key !== 'S') {
    startGame();
  }
});

// Restart button
$("#restartBtn").click(function() {
  resetGame();
  startGame();
});

// Magic button
$("#magicBtn").click(function() {
  specialEffects = !specialEffects;
  showFloatingMessage(specialEffects ? "✨ MAGIC MODE ACTIVATED! ✨" : "✨ MAGIC MODE DEACTIVATED ✨", "#ffd700");
});

// Skip button
$("#skipBtn").click(function() {
  if (started && allowClick) {
    showFloatingMessage("⚡ LEVEL SKIPPED! ⚡", "#ffaa00");
    allowClick = false;
    setTimeout(function() { nextSequence(); }, 500);
  }
});

// Keyboard shortcuts
$(document).keydown(function(e) {
  if (e.key === 'm' || e.key === 'M') {
    specialEffects = !specialEffects;
    showFloatingMessage(specialEffects ? "✨ MAGIC MODE ACTIVATED! ✨" : "✨ MAGIC MODE DEACTIVATED ✨", "#ffd700");
  }
  if ((e.key === 's' || e.key === 'S') && started && allowClick) {
    showFloatingMessage("⚡ LEVEL SKIPPED! ⚡", "#ffaa00");
    allowClick = false;
    setTimeout(function() { nextSequence(); }, 500);
  }
  if (e.key === 'r' || e.key === 'R') {
    resetGame();
    startGame();
  }
});

// Difficulty selector
$(".difficulty-card-premium").click(function() {
  $(".difficulty-card-premium").removeClass("active");
  $(this).addClass("active");
  
  if ($(this).hasClass("easy-prem")) {
    currentDifficulty = "easy";
    sequenceDelay = difficultySettings.easy.speed;
  } else if ($(this).hasClass("normal-prem")) {
    currentDifficulty = "normal";
    sequenceDelay = difficultySettings.normal.speed;
  } else if ($(this).hasClass("hard-prem")) {
    currentDifficulty = "hard";
    sequenceDelay = difficultySettings.hard.speed;
  } else if ($(this).hasClass("extreme-prem")) {
    currentDifficulty = "extreme";
    sequenceDelay = difficultySettings.extreme.speed;
  }
  
  if (!started) {
    $(".card-content span").text("PRESS ANY KEY TO START");
  } else {
    if (confirm("Change difficulty will restart the game. Continue?")) {
      resetGame();
      startGame();
    }
  }
});

function showFloatingMessage(message, color) {
  var msg = $('<div class="floating-msg">' + message + '</div>');
  $("body").append(msg);
  setTimeout(function() { msg.remove(); }, 2000);
}

function createParticleBurst(x, y, color) {
  if (!specialEffects) return;
  for (var i = 0; i < 25; i++) {
    var particle = $('<div class="particle"></div>');
    $("body").append(particle);
    particle.css({
      position: 'fixed',
      left: x + 'px',
      top: y + 'px',
      width: '8px',
      height: '8px',
      background: color,
      pointerEvents: 'none',
      zIndex: '10000',
      borderRadius: '50%'
    });
    var angle = Math.random() * Math.PI * 2;
    var velocity = 2 + Math.random() * 5;
    var vx = Math.cos(angle) * velocity;
    var vy = Math.sin(angle) * velocity;
    var opacity = 1;
    var interval = setInterval(function() {
      var left = parseFloat(particle.css("left")) + vx;
      var top = parseFloat(particle.css("top")) + vy;
      opacity -= 0.05;
      particle.css({ left: left + 'px', top: top + 'px', opacity: opacity });
      if (opacity <= 0) { clearInterval(interval); particle.remove(); }
    }, 30);
  }
}

function createConfetti() {
  if (!specialEffects) return;
  var colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#ff9ff3', '#feca57', '#00cec9', '#fd79a8'];
  for (var i = 0; i < 80; i++) {
    var confetti = $('<div class="confetti"></div>');
    $("body").append(confetti);
    confetti.css({
      position: 'fixed',
      left: Math.random() * window.innerWidth + 'px',
      top: '-20px',
      width: (10 + Math.random() * 15) + 'px',
      height: (10 + Math.random() * 15) + 'px',
      background: colors[Math.floor(Math.random() * colors.length)],
      pointerEvents: 'none',
      zIndex: '10000',
      borderRadius: '5px'
    });
    var speed = 3 + Math.random() * 7;
    var rotation = 0;
    var interval = setInterval(function() {
      var top = parseFloat(confetti.css("top")) + speed;
      rotation += 15;
      confetti.css({ top: top + 'px', transform: 'rotate(' + rotation + 'deg)' });
      if (top > window.innerHeight) { clearInterval(interval); confetti.remove(); }
    }, 20);
  }
}

function startGame() {
  started = true;
  level = 0;
  gamePattern = [];
  userClickedPattern = [];
  streak = 0;
  updateStreak();
  allowClick = true;
  $(".card-content span").html("🎮 LEVEL " + level + " - LET'S PLAY! 🎮");
  showFloatingMessage("🎉 GAME STARTED! GOOD LUCK! 🎉", "#00ff88");
  nextSequence();
}

function resetGame() {
  started = false;
  level = 0;
  gamePattern = [];
  userClickedPattern = [];
  streak = 0;
  updateStreak();
  allowClick = true;
  $(".card-content span").text("PRESS ANY KEY TO START");
  $("#score").text("0");
}

$(".beauty-btn").click(function() {
  if (started && allowClick) {
    var userChosenColour = $(this).attr("id");
    userClickedPattern.push(userChosenColour);
    var offset = $(this).offset();
    var color = $(this).css("backgroundImage");
    createParticleBurst(offset.left + 100, offset.top + 100, "#ffffff");
    playSound(userChosenColour);
    animatePress(userChosenColour);
    checkAnswer(userClickedPattern.length - 1);
  }
});

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      streak++;
      if (streak === 3 && specialEffects) { showFloatingMessage("🔥 ON FIRE! 🔥", "#ffaa00"); createConfetti(); }
      else if (streak === 5 && specialEffects) { showFloatingMessage("⚡ UNSTOPPABLE! ⚡", "#ffff00"); createConfetti(); }
      else if (streak === 10 && specialEffects) { showFloatingMessage("🏆 LEGENDARY! 🏆", "#ffd700"); createConfetti(); }
      updateStreak();
      $("#score").text(level);
      if (level > bestScore) {
        bestScore = level;
        $("#best").text(bestScore);
        localStorage.setItem("simonBestScore", bestScore);
        if (specialEffects) { showFloatingMessage("🎉 NEW HIGH SCORE! 🎉", "#ffd700"); createConfetti(); }
      }
      if (specialEffects && level % 5 === 0 && level > 0) { 
        createConfetti(); 
        showFloatingMessage("🌟 AMAZING! LEVEL " + level + " COMPLETED! 🌟", "#ff00ff");
      }
      allowClick = false;
      setTimeout(function() { nextSequence(); }, 1000);
    }
  } else {
    if (specialEffects) { showFloatingMessage("💥 GAME OVER! TRY AGAIN! 💥", "#ff0000"); }
    gameOver();
  }
}

function nextSequence() {
  userClickedPattern = [];
  level++;
  $(".card-content span").html("🎯 LEVEL " + level + " - WATCH CAREFULLY! 🎯");
  if (level % 5 === 0 && level > 0 && currentDifficulty !== "extreme") {
    var newSpeed = Math.max(200, sequenceDelay - 30);
    if (newSpeed !== sequenceDelay) { 
      sequenceDelay = newSpeed; 
      if (specialEffects) { showFloatingMessage("⚡ SPEED INCREASED! ⚡", "#ff6600"); }
    }
  }
  var randomNumber = Math.floor(Math.random() * 4);
  var randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);
  playSequence();
}

function playSequence() {
  allowClick = false;
  var i = 0;
  function showNext() {
    if (i < gamePattern.length) {
      var color = gamePattern[i];
      $("#" + color).fadeOut(100).fadeIn(100);
      $("#" + color).css("filter", "brightness(1.3)");
      setTimeout(function() { $("#" + color).css("filter", ""); }, 150);
      playSound(color);
      i++;
      setTimeout(showNext, sequenceDelay);
    } else {
      allowClick = true;
      if (level > 1 && specialEffects) { showFloatingMessage("🎯 YOUR TURN! REPEAT THE SEQUENCE! 🎯", "#48dbfb"); }
    }
  }
  showNext();
}

function gameOver() {
  playSound("wrong");
  started = false;
  allowClick = false;
  $("body").addClass("game-over");
  $(".card-content span").html("💀 GAME OVER! SCORE: " + level + " 💀");
  streak = 0;
  updateStreak();
  if (window.navigator && window.navigator.vibrate) { window.navigator.vibrate(200); }
  setTimeout(function() { $("body").removeClass("game-over"); }, 500);
  setTimeout(function() { resetGame(); }, 1000);
}

function animatePress(currentColor) {
  $("#" + currentColor).addClass("pressed");
  setTimeout(function() { $("#" + currentColor).removeClass("pressed"); }, 150);
}

function updateStreak() {
  $("#streak").text(streak);
  if (streak >= 10) { $("#streak").css("color", "#ffd700"); }
  else if (streak >= 5) { $("#streak").css("color", "#ffaa00"); }
  else if (streak >= 3) { $("#streak").css("color", "#ff6b6b"); }
  else { $("#streak").css("color", "white"); }
}

function playSound(name) {
  var audio = new Audio();
  var paths = [name + ".mp3", "sounds/" + name + ".mp3", "audio/" + name + ".mp3"];
  var played = false;
  for (var i = 0; i < paths.length; i++) {
    audio = new Audio(paths[i]);
    audio.play().then(function() { played = true; }).catch(function(e) {});
    if (played) break;
  }
  setTimeout(function() {
    if (!played) {
      try {
        var audioContext = new (window.AudioContext || window.webkitAudioContext)();
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        var frequencies = { red: 261.63, green: 329.63, blue: 392.00, yellow: 523.25, wrong: 130.81 };
        oscillator.frequency.value = frequencies[name] || 440;
        oscillator.type = "sine";
        gainNode.gain.value = 0.2;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.4);
        setTimeout(function() { try { oscillator.disconnect(); gainNode.disconnect(); } catch(e) {} }, 500);
      } catch(e) {}
    }
  }, 50);
}