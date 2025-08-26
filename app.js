// ------------------------------ SLIDES, PAGINATION & PROGRESS ------------------------------
const slides = Array.from(document.querySelectorAll(".slide"));
const total = slides.length;
const progressFill = document.getElementById("progress-fill");
const progressCurrent = document.getElementById("progress-current");
const progressTotal = document.getElementById("progress-total");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnStartTest = document.getElementById("btn-start-test");

let index = 0;
progressTotal.textContent = total;

function setProgress(i) {
  progressCurrent.textContent = i + 1;
  const pct = ((i + 1) / total) * 100;
  progressFill.style.width = pct + "%";
}

function updatePager() {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  btnPrev.disabled = isFirst;
  btnNext.disabled = isLast;

  if (isLast) {
    btnPrev.style.display = "none";
    btnNext.style.display = "none";
    if (btnStartTest) btnStartTest.style.display = "inline-flex";
  } else {
    btnPrev.style.display = "";
    btnNext.style.display = "";
    if (btnStartTest) btnStartTest.style.display = "none";
  }
}

function go(to) {
  if (to < 0 || to >= total || to === index) return;
  const direction = to > index ? "forward" : "back";
  const current = slides[index];
  const next = slides[to];

  next.classList.remove(
    "active",
    "enter-left",
    "enter-right",
    "leave-left",
    "leave-right"
  );
  current.classList.remove(
    "enter-left",
    "enter-right",
    "leave-left",
    "leave-right"
  );

  if (btnStartTest) {
    btnStartTest.addEventListener("click", () => {
      const testStart = document.querySelector(
        ".slide[data-test-start], .slide.test-start"
      );
      const targetIndex = testStart ? slides.indexOf(testStart) : 0;
      if (targetIndex >= 0) go(targetIndex);
    });
  }

  current.classList.remove("active");

  void next.offsetWidth;

  next.classList.add("active");
  next.classList.add(direction === "forward" ? "enter-right" : "enter-left");

  const ACT_MS = 460;
  setTimeout(() => {
    next.classList.remove("enter-right", "enter-left");
    initStatsInSlide(next);
  }, ACT_MS);

  index = to;
  setProgress(index);
  updatePager();
}

btnPrev.addEventListener("click", () => go(index - 1));
btnNext.addEventListener("click", () => go(index + 1));

// init
slides[0].classList.add("active");
setProgress(index);
updatePager();
initStatsInSlide(slides[index]);

// ------------------------------ MODAL ------------------------------
document.addEventListener("click", (e) => {
  const openBtn = e.target.closest("[data-open-modal]");
  if (openBtn) {
    const id = openBtn.getAttribute("data-open-modal");
    const modal = document.getElementById(id);
    if (modal) modal.setAttribute("aria-hidden", "false");
  }
  if (e.target.matches("[data-close-modal]")) {
    const modal = e.target.closest(".modal");
    if (modal) modal.setAttribute("aria-hidden", "true");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document
      .querySelectorAll('.modal[aria-hidden="false"]')
      .forEach((m) => m.setAttribute("aria-hidden", "true"));
  }
});

// ------------------------------ QUESTION CALLOUT (single box) ------------------------------
document.addEventListener("change", (e) => {
  const radio = e.target.closest('input[type="radio"][data-template]');
  if (!radio) return;
  const slide = radio.closest(".slide");
  const box = slide.querySelector(".callout-box");
  const tpl = document.getElementById(radio.dataset.template);
  if (!box || !tpl) return;

  box.innerHTML = `<div class="callout-inner">${tpl.innerHTML}</div>`;
  box.classList.add("show");
});

// ------------------------------ STATS PROGRESS ------------------------------
function initStatsInSlide(slideEl) {
  slideEl.querySelectorAll(".stat-card").forEach((card) => {
    const pct = parseFloat(card.getAttribute("data-percent")) || 0;
    const num = card.querySelector(".stat-percent");
    if (num) num.textContent = pct + "%";
    const fill = card.querySelector(".fill");
    if (fill) {
      fill.style.width = "0%";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fill.style.width = pct + "%";
        });
      });
    }
    const title = card.getAttribute("data-title");
    const tEl = card.querySelector(".stat-title");
    if (title && tEl) tEl.textContent = title;
  });
}

// ------------------------------ FLIP CARD ------------------------------
document.querySelectorAll(".flip-card").forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("is-flipped");
  });
});

// ------------------------------ A/B REFLEXIA ------------------------------
document.addEventListener("change", (e) => {
  const ab = e.target.closest('input[type="radio"][data-choice]');
  if (!ab) return;

  const card = ab.closest(".ab-card");
  if (!card) return;

  const answerText = card.getAttribute("data-answer") || "";
  const answerEl = card.querySelector(".ab-answer");
  if (!answerEl) return;

  answerEl.textContent = answerText;
  answerEl.classList.add("show");
});

// ------------------------------ RISK CHECKBOXES ------------------------------
document.addEventListener("click", (e) => {
  const btn = e.target.closest('[data-eval="risk"]');
  if (!btn) return;
  const slide = btn.closest(".slide");
  const box = slide.querySelector(".result-box");
  if (box) box.hidden = false;
});

// ------------------------------ MCQ (single-choice) ------------------------------
document.addEventListener("change", (e) => {
  const input = e.target.closest('input[type="radio"]');
  if (!input) return;

  const option = input.closest(".mcq-option");
  if (!option) return;

  const form = option.closest("form.mcq");
  if (!form) return;

  form.querySelectorAll(".mcq-option").forEach((opt) => {
    opt.classList.remove("is-wrong", "is-correct");
  });

  const feedbackBox = form.parentElement.querySelector(".mcq-feedback");
  if (feedbackBox) {
    feedbackBox.classList.remove("show");
    feedbackBox.innerHTML = "";
  }

  if (option.dataset.correct === "true") {
    option.classList.add("is-correct");
    const msg = form.getAttribute("data-feedback") || "Správne.";
    if (feedbackBox) {
      feedbackBox.innerHTML = `<div class="mcq-correct"><p>${msg}</p></div>`;
      feedbackBox.classList.add("show");
    }
  } else {
    option.classList.add("is-wrong");
    const msg =
      form.getAttribute("data-feedback-wrong") || "Nesprávna odpoveď.";
    if (feedbackBox) {
      feedbackBox.innerHTML = `<div class="mcq-wrong"><p>${msg}</p></div>`;
      feedbackBox.classList.add("show");
    }
  }
});

// ------------------------------ TRUE/FALSE ------------------------------
document.addEventListener("change", (e) => {
  const input = e.target.closest('.tf-card input[type="radio"]');
  if (!input) return;

  const option = input.closest(".tf-option");
  const card = input.closest(".tf-card");
  if (!option || !card) return;

  card
    .querySelectorAll(".tf-option")
    .forEach((o) => o.classList.remove("is-wrong"));
  const ans = card.querySelector(".tf-answer");
  if (ans) {
    ans.classList.remove("show");
  }

  const correct = (card.dataset.correct || "").toLowerCase(); // 'mytus' / 'fakt'
  const value = (input.dataset.val || "").toLowerCase();

  if (value === correct) {
    if (ans) ans.classList.add("show");
  } else {
    option.classList.add("is-wrong");
  }
});

// ------------------------------ ABC test (a/b/c) ------------------------------
document.addEventListener("change", (e) => {
  const input = e.target.closest('.abc-card input[type="radio"]');
  if (!input) return;

  const card = input.closest(".abc-card");
  const opt = input.closest(".abc-option");
  if (!card || !opt) return;

  card
    .querySelectorAll(".abc-option")
    .forEach((o) => o.classList.remove("is-wrong", "is-correct"));

  const correct = (card.dataset.correct || "").toLowerCase(); // 'a' | 'b' | 'c'
  const value = (input.dataset.abc || "").toLowerCase();

  if (value === correct) {
    opt.classList.add("is-correct");
  } else {
    opt.classList.add("is-wrong");
  }
});
