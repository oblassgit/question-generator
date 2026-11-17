const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const appSource = readFileSync(join(__dirname, 'index.js'), 'utf8');
const questionsSource = readFileSync(join(__dirname, 'questions.js'), 'utf8');

function openPage(questionList, randomValues = [0]) {
  const question = { textContent: '' };
  let onClick;
  const button = {
    disabled: true,
    addEventListener(event, handler) {
      assert.equal(event, 'click');
      onClick = handler;
    },
  };
  let randomIndex = 0;
  const context = vm.createContext({
    document: {
      getElementById(id) {
        if (id === 'question') return question;
        if (id === 'another-question') return button;
        throw new Error(`Unexpected element: ${id}`);
      },
    },
    Math: {
      floor: Math.floor,
      random: () => randomValues[randomIndex++ % randomValues.length],
    },
  });

  vm.runInContext(
    questionList === undefined
      ? questionsSource
      : `const questions = ${JSON.stringify(questionList)};`,
    context,
  );
  vm.runInContext(appSource, context);
  return { question, button, click: () => onClick() };
}

test('renders a configured sample question immediately', () => {
  const page = openPage();
  assert.ok(page.question.textContent.length > 0);
  assert.equal(page.button.disabled, false);
});

test('loads the complete question set without duplicate entries', () => {
  const questions = JSON.parse(
    vm.runInNewContext(`${questionsSource}\nJSON.stringify(questions);`),
  );
  assert.equal(questions.length, 44);
  assert.equal(new Set(questions).size, 44);
  assert.equal(questions[0], 'Wie sieht für dich ein perfekter freier Tag aus?');
  assert.equal(
    questions.at(-1),
    'Wenn du dein Leben bisher mit einem Buchtitel beschreiben müsstest, welcher wäre es?',
  );
});

test('initial selection covers both random boundaries', () => {
  for (const [random, expected] of [[0, 'First'], [0.999999, 'Last']]) {
    const page = openPage(['First', 'Middle', 'Last'], [random]);
    assert.equal(page.question.textContent, expected);
  }
});

test('subsequent selections reach every index except the current one', () => {
  const questions = ['First', 'Middle', 'Last'];
  for (let current = 0; current < questions.length; current += 1) {
    const expected = questions.filter((_, index) => index !== current);
    for (const [random, next] of [[0, expected[0]], [0.999999, expected[1]]]) {
      const page = openPage(questions, [(current + 0.5) / questions.length, random]);
      page.click();
      assert.equal(page.question.textContent, next);
    }
  }
});

test('two questions alternate on repeated button clicks', () => {
  const page = openPage(['First', 'Second']);
  for (let index = 0; index < 10; index += 1) {
    const previous = page.question.textContent;
    page.click();
    assert.notEqual(page.question.textContent, previous);
  }
});

test('one question is displayed with the button disabled', () => {
  const page = openPage(['Only question']);
  assert.equal(page.question.textContent, 'Only question');
  assert.equal(page.button.disabled, true);
  page.click();
  assert.equal(page.question.textContent, 'Only question');
});

test('an empty question set displays a message with the button disabled', () => {
  const page = openPage([]);
  assert.equal(page.question.textContent, 'Es sind noch keine Fragen hinterlegt.');
  assert.equal(page.button.disabled, true);
});

test('question text is rendered literally', () => {
  const page = openPage(['<strong>Is this literal text?</strong>']);
  assert.equal(page.question.textContent, '<strong>Is this literal text?</strong>');
});
