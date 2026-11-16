# Random question

Open `index.html` in a browser. A random question appears immediately; select
**Another question** to get a new one without reloading the page.
No installation, build step, or server is required. The files can also be served
by any static host.

Edit the `questions` array in `questions.js` to configure the question set.
Use unique, non-empty strings. With multiple questions, consecutive selections
never repeat the current question. Reloading starts fresh and may repeat it.
With one question, the button is disabled; with none, an empty-state message
appears.

Run the automated tests with Node.js 18 or later:

```sh
npm test
```
