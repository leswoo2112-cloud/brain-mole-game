const holes = document.querySelectorAll(".hole");
const score = document.getElementById("score");
const time = document.getElementById("time");
const startBtn = document.getElementById("startBtn");

let point = 0;
let second = 30;
let game = false;
let moleTimer;
let gameTimer;

function showMole() {
  holes.forEach(hole => hole.classList.remove("mole"));

  const random = Math.floor(Math.random() * holes.length);
  holes[random].classList.add("mole");
}

function startGame() {
  point = 0;
  second = 30;
  game = true;

  score.textContent = point;
  time.textContent = second;
  startBtn.disabled = true;

  showMole();

  moleTimer = setInterval(showMole, 800);

  gameTimer = setInterval(() => {
    second--;
    time.textContent = second;

    if (second <= 0) {
      clearInterval(moleTimer);
      clearInterval(gameTimer);
      holes.forEach(hole => hole.classList.remove("mole"));

      game = false;
      startBtn.disabled = false;

      alert("게임 종료!\n점수: " + point);
    }
  }, 1000);
}

holes.forEach(hole => {
  hole.addEventListener("click", () => {
    if (!game) return;

    if (hole.classList.contains("mole")) {
      point++;
      score.textContent = point;
      hole.classList.remove("mole");
    }
  });
});

startBtn.addEventListener("click", startGame);