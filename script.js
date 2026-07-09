import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDB-qCvq7eCwjSFH5Vln9bGzOENwii_sis",
  authDomain: "brain-mole-ranking.firebaseapp.com",
  projectId: "brain-mole-ranking",
  storageBucket: "brain-mole-ranking.firebasestorage.app",
  messagingSenderId: "882485062214",
  appId: "1:882485062214:web:24cfe6aa97da8ec9c13847",
  measurementId: "G-HJ8LH8QH6T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const holes = document.querySelectorAll(".hole");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const mission = document.getElementById("mission");
const countdown = document.getElementById("countdown");
const eventText = document.getElementById("eventText");

const playerNameInput = document.getElementById("playerName");
const saveNameBtn = document.getElementById("saveNameBtn");
const currentPlayerText = document.getElementById("currentPlayer");

const top3 = document.getElementById("top3");
const rankingList = document.getElementById("rankingList");
const resetRankBtn = document.getElementById("resetRankBtn");

let score = 0;
let time = 30;
let playing = false;
let moleTimer;
let gameTimer;
let speedTimer;
let currentSpeed = 800;
let playerName = localStorage.getItem("playerName") || "";

if (playerNameInput && currentPlayerText && playerName) {
  playerNameInput.value = playerName;
  currentPlayerText.textContent = playerName;
}

function clearHoles() {
  holes.forEach(hole => {
    hole.className = "hole";
  });
}

function showEvent(text) {
  if (!eventText) return;

  eventText.textContent = text;

  setTimeout(() => {
    eventText.textContent = "";
  }, 1000);
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

  const doubleChance = Math.random() < 0.25;
  const fakeChance = Math.random() < 0.25;

  const moleCount = doubleChance ? 2 : 1;
  const moleIndexes = randomIndexes(moleCount);

  if (doubleChance) {
    showEvent("🐹 더블 두더지!");
  }

  moleIndexes.forEach(index => {
    holes[index].classList.add("mole");
  });

  if (fakeChance) {
    const emptyHoles = [...holes].filter(hole => !hole.classList.contains("mole"));

    if (emptyHoles.length > 0) {
      const fakeHole = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
      fakeHole.classList.add("fake");
      showEvent("💣 가짜 조심!");
    }
  }
}

function changeSpeedRandomly() {
  if (!playing) return;

  clearInterval(moleTimer);

  const random = Math.random();

  if (random < 0.33) {
    currentSpeed = 450;
    showEvent("⚡ 갑자기 빨라짐!");
  } else if (random < 0.66) {
    currentSpeed = 1200;
    showEvent("🐢 갑자기 느려짐!");
  } else {
    currentSpeed = 800;
    showEvent("🎯 보통 속도!");
  }

  moleTimer = setInterval(showMole, currentSpeed);
}

function startCountdown() {
  if (!playerName) {
    alert("이름을 먼저 입력해줘용!");
    return;
  }

  let count = 3;
  countdown.textContent = count;
  startBtn.disabled = true;

  const countTimer = setInterval(() => {
    count--;

    if (count > 0) {
      countdown.textContent = count;
    } else {
      clearInterval(countTimer);
      countdown.textContent = "START!";

      setTimeout(() => {
        countdown.textContent = "";
        startGame();
      }, 600);
    }
  }, 800);
}

function startGame() {
  score = 0;
  time = 30;
  playing = true;
  currentSpeed = 800;

  scoreText.textContent = score;
  timeText.textContent = time;
  mission.textContent = "30초 동안 두더지를 눌러 점수를 올려용! 💣는 감점!";

  showMole();

  moleTimer = setInterval(showMole, currentSpeed);

  speedTimer = setInterval(() => {
    changeSpeedRandomly();
  }, 7000);

  gameTimer = setInterval(() => {
    time--;
    timeText.textContent = time;

    if (time <= 0) {
      endGame();
    }
  }, 1000);
}

async function saveScore() {
  await addDoc(collection(db, "rankings"), {
    name: playerName,
    score: score,
    createdAt: serverTimestamp()
  });
}

async function endGame() {
  playing = false;

  clearInterval(moleTimer);
  clearInterval(gameTimer);
  clearInterval(speedTimer);
  clearHoles();

  startBtn.disabled = false;

  if (eventText) {
    eventText.textContent = "";
  }

  try {
    await saveScore();
    alert("게임 종료!\n이름: " + playerName + "\n점수: " + score + "\n랭킹에 저장됐어용!");
  } catch (error) {
    alert("점수 저장 실패! 인터넷/Firebase 설정 확인해줘용.");
    console.error(error);
  }
}

if (holes.length > 0) {
  holes.forEach(hole => {
    hole.addEventListener("click", () => {
      if (!playing) return;

      hole.classList.add("hit");

      setTimeout(() => {
        hole.classList.remove("hit");
      }, 100);

      if (hole.classList.contains("fake")) {
        score -= 2;

        if (score < 0) {
          score = 0;
        }

        showEvent("💣 가짜! -2점");
        clearHoles();
      } else if (hole.classList.contains("mole")) {
        score++;
        hole.className = "hole";
      }

      scoreText.textContent = score;

      if (navigator.vibrate) {
        navigator.vibrate(40);
      }
    });
  });
}

if (saveNameBtn) {
  saveNameBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();

    if (!name) {
      alert("이름을 입력해줘용!");
      return;
    }

    playerName = name;
    localStorage.setItem("playerName", playerName);
    currentPlayerText.textContent = playerName;

    alert(playerName + " 참가 완료!");
  });
}

if (startBtn) {
  startBtn.addEventListener("click", startCountdown);
}

function renderRanking(players) {
  if (!top3 || !rankingList) return;

  top3.innerHTML = "";
  rankingList.innerHTML = "";

  const medals = ["🥇", "🥈", "🥉"];

  players.slice(0, 3).forEach((player, index) => {
    const card = document.createElement("div");
    card.className = "rankCard rank" + (index + 1);

    card.innerHTML = `
      <div>${medals[index]} ${index + 1}등</div>
      <div>${player.name}</div>
      <div>${player.score}점</div>
    `;

    top3.appendChild(card);
  });

  players.forEach((player, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}등 - ${player.name} : ${player.score}점`;
    rankingList.appendChild(li);
  });
}

if (top3 && rankingList) {
  const rankingQuery = query(
    collection(db, "rankings"),
    orderBy("score", "desc"),
    limit(130)
  );

  onSnapshot(rankingQuery, snapshot => {
    const players = [];

    snapshot.forEach(doc => {
      players.push(doc.data());
    });

    renderRanking(players);
  });
}

if (resetRankBtn) {
  resetRankBtn.addEventListener("click", async () => {
    const password = prompt("랭킹 초기화 비밀번호를 입력해줘용!");

    if (password !== "1234") {
      alert("비밀번호가 틀렸어용!");
      return;
    }

    const ok = confirm("정말 랭킹을 전부 초기화할까요?");

    if (!ok) return;

    try {
      const snapshot = await getDocs(collection(db, "rankings"));
      const deleteList = [];

      snapshot.forEach(docItem => {
        deleteList.push(deleteDoc(docItem.ref));
      });

      await Promise.all(deleteList);

      alert("랭킹 초기화 완료!");
    } catch (error) {
      alert("랭킹 초기화 실패! Firebase 설정 확인해줘용.");
      console.error(error);
    }
  });
}