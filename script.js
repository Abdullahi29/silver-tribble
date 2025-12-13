document.addEventListener("DOMContentLoaded", () => {

  /* ========= ELEMENTS ========= */
  const petSelection = document.getElementById("petSelection");
  const petBtns = document.querySelectorAll(".pet-btn");
  const petContainer = document.getElementById("petContainer");
  const petEmoji = document.getElementById("petEmoji");
  const petMood = document.getElementById("petMood");

  const hungerBar = document.getElementById("hungerBar");
  const happinessBar = document.getElementById("happinessBar");
  const energyBar = document.getElementById("energyBar");

  const feedBtn = document.getElementById("feedBtn");
  const playBtn = document.getElementById("playBtn");
  const sleepBtn = document.getElementById("sleepBtn");

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const gameScoreEl = document.getElementById("gameScore");

  /* ========= INITIAL SETUP ========= */
  let petType = localStorage.getItem("petType") || null;
  let hunger = parseInt(localStorage.getItem("petHunger")) || 50;
  let happiness = parseInt(localStorage.getItem("petHappiness")) || 50;
  let energy = parseInt(localStorage.getItem("petEnergy")) || 50;

  if (petType) {
    petSelection.classList.add("hidden");
    petContainer.classList.remove("hidden");
    petEmoji.textContent = petType;
  }

  /* ========= PET SELECTION ========= */
  petBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      petType = btn.dataset.pet;
      localStorage.setItem("petType", petType);
      petEmoji.textContent = petType;
      petSelection.classList.add("hidden");
      petContainer.classList.remove("hidden");
    });
  });

  /* ========= UPDATE STATS & MOOD ========= */
  function updateStats() {
    hungerBar.style.width = hunger + "%";
    happinessBar.style.width = happiness + "%";
    energyBar.style.width = energy + "%";

    // Color-coded bars
    hungerBar.style.background = hunger > 60 ? "green" : hunger > 30 ? "orange" : "red";
    happinessBar.style.background = happiness > 60 ? "green" : happiness > 30 ? "orange" : "red";
    energyBar.style.background = energy > 60 ? "green" : energy > 30 ? "orange" : "red";

    // Update pet mood emoji
    if (happiness > 75) {
      petEmoji.textContent = petType + " 😻";
      petMood.textContent = "Ecstatic!";
      document.body.style.background = "#a0f1a0"; // bright green
    } else if (happiness > 50) {
      petEmoji.textContent = petType + " 😺";
      petMood.textContent = "Happy";
      document.body.style.background = "#a0d8f1"; // blue
    } else if (happiness > 25) {
      petEmoji.textContent = petType + " 😐";
      petMood.textContent = "Neutral";
      document.body.style.background = "#f1e0a0"; // yellowish
    } else {
      petEmoji.textContent = petType + " 😿";
      petMood.textContent = "Sad";
      document.body.style.background = "#d0d0d0"; // gray
    }

    // Save stats
    localStorage.setItem("petHunger", hunger);
    localStorage.setItem("petHappiness", happiness);
    localStorage.setItem("petEnergy", energy);
  }

  function animatePet() {
    petEmoji.parentElement.classList.add("bounce");
    setTimeout(() => petEmoji.parentElement.classList.remove("bounce"), 500);
  }

  /* ========= BUTTON INTERACTIONS ========= */
  feedBtn.addEventListener("click", () => {
    hunger = Math.min(hunger + 15, 100);
    happiness = Math.min(happiness + 5, 100);
    animatePet();
    updateStats();
  });

  playBtn.addEventListener("click", () => {
    happiness = Math.min(happiness + 15, 100);
    energy = Math.max(energy - 10, 0);
    animatePet();
    updateStats();
  });

  sleepBtn.addEventListener("click", () => {
    energy = Math.min(energy + 20, 100);
    hunger = Math.max(hunger - 5, 0);
    animatePet();
    updateStats();
  });

  /* ========= AUTO-DECREASE STATS ========= */
  setInterval(() => {
    hunger = Math.max(hunger - 1, 0);
    happiness = Math.max(happiness - 1, 0);
    energy = Math.max(energy - 1, 0);
    updateStats();
  }, 5000);

  updateStats(); // initial call

  /* ========= MINI-GAME: CATCH THE TREAT ========= */
  let treats = [];
  let score = 0;
  let player = { x: canvas.width/2 - 20, y: canvas.height-30, width: 40, height: 20, color: "#3ddc84" };
  let keys = {};

  document.addEventListener("keydown", e => keys[e.key] = true);
  document.addEventListener("keyup", e => keys[e.key] = false);

  function spawnTreat() {
    treats.push({ x: Math.random()*380, y: 0, width: 20, height: 20, color: "#ffcc00" });
  }
  setInterval(spawnTreat, 2000);

  function gameLoop() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Move player
    if(keys["ArrowLeft"]) player.x -= 5;
    if(keys["ArrowRight"]) player.x += 5;
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Update treats
    for(let i = treats.length-1; i >= 0; i--){
      treats[i].y += 3;
      ctx.fillStyle = treats[i].color;
      ctx.fillRect(treats[i].x, treats[i].y, treats[i].width, treats[i].height);

      // Check collision
      if(treats[i].y + treats[i].height >= player.y &&
         treats[i].x + treats[i].width >= player.x &&
         treats[i].x <= player.x + player.width){
        treats.splice(i,1);
        score += 1;
        happiness = Math.min(happiness + 5, 100); // reward pet happiness
        updateStats();
      }

      // Remove if falls beyond canvas
      if(treats[i] && treats[i].y > canvas.height) treats.splice(i,1);
    }

    gameScoreEl.textContent = "Score: " + score;
    requestAnimationFrame(gameLoop);
  }

  gameLoop();

});
