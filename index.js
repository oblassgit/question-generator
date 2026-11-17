const questionElement = document.getElementById('question');
const anotherQuestionButton = document.getElementById('another-question');
let currentIndex = -1;

function showRandomQuestion() {
  if (questions.length === 0) {
    questionElement.textContent = 'Es sind noch keine Fragen hinterlegt.';
    return;
  }

  const availableCount = questions.length - (currentIndex === -1 ? 0 : 1);
  if (availableCount === 0) {
    return;
  }

  let nextIndex = Math.floor(Math.random() * availableCount);
  if (currentIndex !== -1 && nextIndex >= currentIndex) {
    nextIndex += 1;
  }

  currentIndex = nextIndex;
  questionElement.textContent = questions[currentIndex];
}

anotherQuestionButton.disabled = questions.length < 2;
anotherQuestionButton.addEventListener('click', showRandomQuestion);
showRandomQuestion();
