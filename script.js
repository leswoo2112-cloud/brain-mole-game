const holes = document.querySelectorAll(".hole");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const bestText = document.getElementById("best");
const startBtn = document.getElementById("startBtn");
const modeSelect = document.getElementById("mode");
const durationSelect = document.getElementById("duration");
const mission = document.getElementById("mission");
const countdown = document.getElementById("countdown");
const eventText = document.getElementById("eventText");

let score = 0;
let time = 30;
let playing = false;
let moleTimer;
let gameTimer;
let currentMode = "normal";
let currentSpeed = 800;

let bestScore = localStorage.getItem("moleBestScore") || 0;
bestText.textContent = bestScore;

function clearHoles() {
  holes.forEach(hole => {
    hole.className = "hole";
  });
}

function showEvent(text) {
  eventText.textContent = text;
  setTimeout(() => {
    eventText.textContent = "";
  }, 1200);
}

function randomIndexes(count) {
  const indexes = [];

  while (indexes.length < count) {
    const random = Math.floor(Math.random() * holes.length);
    if (!indexes.includes(random)) {
      indexes.push(random);
    }
  }

  return indexes;
}

function showMole() {
  clearHoles();

  let doubleChance = Math.random() < 0.25;
  let fakeChance = Math.random() < 0.25;

  if (doubleChance) {
    showEvent("🐹 더블 두더지!");
  }

  const moleCount = doubleChance ? 2 : 1;
  const indexes = randomIndexes(moleCount);

  indexes.forEach(index => {
    if (currentMode === "brain") {
      const isRed = Math.random() < 0.6;
      holes[index].classList.add(isRed ? "red" : "gray");
    } else {
      holes[index].classList.add("mole");
    }
  });

  if (fakeChance) {
    const fakeIndex = randomIndexes(1)[0];

    if (!holes[fakeIndex].classList.contains("mole") &&
        !holes[fakeIndex].classList.contains("red") &&
        !holes[fakeIndex].classList.contains("gray")) {
      holes[fakeIndex].classList.add("fake");
      showEvent("💣 가짜 조심!");
    }
  }
}

function changeSpeedRandomly() {
  if (!playing) return;

  const event = Math.random();

  clearInterval(moleTimer);

  if (event < 0.33) {
    currentSpeed = 450;
    showEvent("⚡ 갑자기 빨라짐!");
  } else if (event < 0.66) {
    currentSpeed = 1200;
    showEvent("🐢 갑자기 느려짐!");
  } else {
    currentSpeed = currentMode === "fast" ? 400 : 800;
    showEvent("🎯 보통 속도!");
  }

  moleTimer = setInterval(showMole, currentSpeed);
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

  currentSpeed = currentMode === "fast" ? 400 : currentMode === "brain" ? 900 : 800;

  scoreText.textContent = score;
  timeText.textContent = time;
  startBtn.disabled = true;

  if (currentMode === "normal") {
    mission.textContent = "일반 모드: 두더지를 빠르게 눌러용!";
  } else if (currentMode === "fast") {
    mission.textContent = "빠른 모드: 속도 변화에 집중해용!";
  } else {
    mission.textContent = "치매 예방 모드: 빨간색만 눌러용! 회색은 감점!";
  }

  showMole();

  moleTimer = setInterval(showMole, currentSpeed);

  gameTimer = setInterval(() => {
    time--;
    timeText.textContent = time;

    if (time % 7 === 0) {
      changeSpeedRandomly();
    }

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
  eventText.textContent = "";

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("moleBestScore", bestScore);
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

    if (hole.classList.contains("fake")) {
      score -= 2;
      showEvent("💣 가짜! -2점");
      clearHoles();
    } else if (currentMode === "brain") {
      if (hole.classList.contains("red")) {
        score++;
        clearHoles();
      } else if (hole.classList.contains("gray")) {
        score--;
        showEvent("⚪ 회색! -1점");
        clearHoles();
      }
    } else {
      if (hole.classList.contains("mole")) {
        score += currentMode === "fast" ? 2 : 1;
        hole.className = "hole";
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