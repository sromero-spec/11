const steps = [
  {
    emoji: "📍",
    title: "Elegir lugar",
    subtitle: "Piensa dónde será la fiesta",
  },
  {
    emoji: "🎂",
    title: "Preparar la tarta",
    subtitle: "Elige el sabor",
  },
  {
    emoji: "💌",
    title: "Invitaciones",
    subtitle: "Elige a quién invitar",
  },
  {
    emoji: "🥤",
    title: "Bebidas",
    subtitle: "Escoge qué beberán",
  },
  {
    emoji: "🍕",
    title: "Comida",
    subtitle: "Piensa en algo fácil",
  },
  {
    emoji: "🎶",
    title: "Música",
    subtitle: "Elige canciones alegres",
  },
  {
    emoji: "🎈",
    title: "Decoración",
    subtitle: "Escoge globos y colores",
  },
  {
    emoji: "🎉",
    title: "Todo listo",
    subtitle: "Revisa que no falte nada",
  },
];

const stepNumber = document.getElementById("step-number");
const stepTotal = document.getElementById("step-total");
const taskCard = document.getElementById("task-card");
const taskEmoji = document.getElementById("task-emoji");
const taskTitle = document.getElementById("task-title");
const taskSubtitle = document.getElementById("task-subtitle");
const reminderText = document.getElementById("reminder-text");
const feedback = document.getElementById("feedback");
const doneButton = document.getElementById("done-button");
const reminderButton = document.getElementById("reminder-button");
const finalScreen = document.getElementById("final-screen");
const progressList = document.getElementById("progress-list");

let currentStep = 0;
stepTotal.textContent = steps.length.toString();

const feedbackMessages = [
  "¡Buen trabajo! Ya falta menos 🎉",
  "¡Genial! Sigue así 🌟",
  "¡Lo estás haciendo muy bien! 👏",
];

const getReminderMessage = () => {
  const current = steps[currentStep];
  return `Hoy toca ${current.title.toLowerCase()} ${current.emoji}`;
};

const updateReminder = () => {
  reminderText.textContent = getReminderMessage();
};

const setTaskState = (state) => {
  taskCard.classList.remove("pending", "current", "completed");
  taskCard.classList.add(state);
};

const updateTask = () => {
  const current = steps[currentStep];
  stepNumber.textContent = (currentStep + 1).toString();
  taskEmoji.textContent = current.emoji;
  taskTitle.textContent = current.title;
  taskSubtitle.textContent = current.subtitle;
  setTaskState("current");
  updateReminder();
  updateProgress();
};

const playChime = () => {
  try {
    const audio = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 520;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audio.close();
    }, 200);
  } catch (error) {
    // Ignore audio errors in browsers without permission.
  }
};

const showFeedback = (message) => {
  const finalMessage =
    message || feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
  feedback.textContent = finalMessage;
  feedback.animate(
    [
      { transform: "scale(1)", opacity: 0.6 },
      { transform: "scale(1.05)", opacity: 1 },
      { transform: "scale(1)", opacity: 1 },
    ],
    { duration: 600, easing: "ease-out" }
  );
};

const sendNotification = (message) => {
  if (!("Notification" in window)) {
    showFeedback("Tu navegador no permite notificaciones.");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(message);
    showFeedback("Recordatorio diario listo ✅");
    return;
  }

  showFeedback("Activa notificaciones con el botón 🔔");
};

const maybeSendDailyReminder = () => {
  if (!("Notification" in window)) return;

  const todayKey = new Date().toISOString().split("T")[0];
  const lastReminder = localStorage.getItem("lastReminderDate");

  if (Notification.permission === "granted" && lastReminder !== todayKey) {
    new Notification(getReminderMessage());
    localStorage.setItem("lastReminderDate", todayKey);
  }
};

const requestReminderPermission = async () => {
  if (!("Notification" in window)) {
    showFeedback("Tu navegador no permite notificaciones.");
    return;
  }

  if (Notification.permission === "granted") {
    sendNotification(getReminderMessage());
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    localStorage.setItem("lastReminderDate", new Date().toISOString().split("T")[0]);
    sendNotification(getReminderMessage());
  } else {
    showFeedback("Seguimos con recordatorios en pantalla 💛");
  }
};

const completeStep = () => {
  if (currentStep >= steps.length) return;
  showFeedback();
  playChime();
  setTaskState("completed");
  markProgressStep(currentStep, "completed");

  setTimeout(() => {
    currentStep += 1;

    if (currentStep === steps.length) {
      document.querySelector(".app").hidden = true;
      finalScreen.hidden = false;
      return;
    }

    updateTask();
  }, 500);
};

const createProgressDots = () => {
  progressList.innerHTML = "";
  steps.forEach((step, index) => {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    dot.setAttribute("role", "listitem");
    dot.setAttribute("aria-label", `Paso ${index + 1}: ${step.title}`);
    progressList.appendChild(dot);
  });
};

const markProgressStep = (index, state) => {
  const dot = progressList.children[index];
  if (!dot) return;
  dot.classList.remove("pending", "current", "completed");
  dot.classList.add(state);
};

const updateProgress = () => {
  steps.forEach((_, index) => {
    if (index < currentStep) {
      markProgressStep(index, "completed");
    } else if (index === currentStep) {
      markProgressStep(index, "current");
    } else {
      markProgressStep(index, "pending");
    }
  });
};

reminderButton.addEventListener("click", requestReminderPermission);

doneButton.addEventListener("click", completeStep);

createProgressDots();
updateTask();
maybeSendDailyReminder();
