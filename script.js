const holes = document.querySelectorAll(".hole");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const bestText = document.getElementById("best");
const startBtn = document.getElementById("startBtn");
const modeSelect = document.getElementById("mode");
const durationSelect = document.getElementById("duration");
const mission = document.getElementById("mission");
const countdown = document.getElementById("countdown");

let score = 0;
let time = 30;
let playing = false;
let moleTimer;
let gameTimer;
let currentMode = "normal";

let bestScore = localStorage.getItem("bestScore") || 0;
bestText.textContent = bestScore;

function clearHoles() {
  holes.forEach(hole => {
    hole.className = "hole";
  });
}

function showMole() {
  clearHoles();

  const random = Math.floor(Math.random() * holes.length);
  const hole = holes[random];

  if (currentMode === "brain") {
    const isRed = Math.random() < 0.5;
    hole.classList.add(isRed ? "red" : "gray");
  } else {
    hole.classList.add("mole");
  }
}

function startCountdown() {
  let count = 3;
  countdown.textContent = count;

  const countTimer = setInterval(() => {
    count--;

    if (count > 0) {
      countdown.textContent = count;
    } else {
      countdown.textContent = "START!";
      clearInterval(countTimer);

      setTimeout(() => {
        countdown.textContent = "";
        startGame();
      }, 600);
    }
  }, 800);
}

function startGame() {
  score = 0;
  time = Number(durationSelect.value);
  currentMode = modeSelect.value;
  playing = true;

  scoreText.textContent = score;
  timeText.textContent = time;
  startBtn.disabled = true;

  if (currentMode === "normal") {
    mission.textContent = "일반 모드: 두더지를 빠르게 눌러용!";
  } else if (currentMode === "fast") {
    mission.textContent = "빠른 모드: 젊은 사람용! 빠르게 눌러용!";
  } else {
    mission.textContent = "치매 예방 모드: 빨간색만 눌러용! 회색은 누르면 감점!";
  }

  showMole();

  const speed = currentMode === "fast" ? 400 : currentMode === "brain" ? 900 : 800;

  moleTimer = setInterval(showMole, speed);

  gameTimer = setInterval(() => {
    time--;
    timeText.textContent = time;

    if (time <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  playing = false;
  clearInterval(moleTimer);
  clearInterval(gameTimer);
  clearHoles();

  startBtn.disabled = false;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    bestText.textContent = bestScore;
  }

  let grade = "";

  if (score < 10) {
    grade = "연습이 필요해용 🙂";
  } else if (score < 25) {
    grade = "좋아용! 집중력 굿!";
  } else if (score < 40) {
    grade = "엄청 빠르다용 😎";
  } else {
    grade = "브레인 마스터 🏆";
  }

  alert("게임 종료!\n점수: " + score + "\n최고점수: " + bestScore + "\n" + grade);
}

holes.forEach(hole => {
  hole.addEventListener("click", () => {
    if (!playing) return;

    hole.classList.add("hit");
    setTimeout(() => hole.classList.remove("hit"), 100);

    if (currentMode === "brain") {
      if (hole.classList.contains("red")) {
        score++;
        clearHoles();
      } else if (hole.classList.contains("gray")) {
        score--;
        clearHoles();
      }
    } else {
      if (hole.classList.contains("mole")) {
        score += currentMode === "fast" ? 2 : 1;
        clearHoles();
      }
    }

    if (score < 0) score = 0;
    scoreText.textContent = score;

    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  });
});

startBtn.addEventListener("click", startCountdown);