# Research: Jev's primitives, SDK, cost and limits (#238)

Resolves [#238](https://github.com/justinclayton/nvu-game/issues/238), a wayfinder research
ticket under the Agentic GDLC map ([#233](https://github.com/justinclayton/nvu-game/issues/233)).
Facts only, each with its source. No recommendation.

**Sources read, 2026-10-01.** TypeSafe's docs at <https://docs.typesafe.ai> (index at
<https://docs.typesafe.ai/llms.txt>), the npm registry entry for `@typesafe-ai/sdk`, and the
SDK's source at the `v0.6.0` tag on GitHub. The API was not called. Where the docs do not
state a figure, the "Not established" list at the end says so.

**Current model.** `jev-1.13.0`, which both aliases `jev-latest` and `jev-preview` resolve
to. The jaggedness page was last reviewed 2026-09-17. — <https://docs.typesafe.ai/models>

## The three primitives and the advanced structure page

### Request shape (shared by all three)

- One endpoint: `POST https://api.typesafe.ai/v1/systemone` with
  `Authorization: Bearer <API_KEY>` and `Content-Type: application/json`.
  — <https://docs.typesafe.ai/api>
- Three required top-level fields: `state` (`string | object | array`), `model` (`string`),
  and `questions` (`map<string, Question>`). You choose each question's key; the answer
  comes back under the same key. The key is not sent to the model.
  — <https://docs.typesafe.ai/api>
- Every question has `type` (`"choice"`, `"score"`, or `"noul"`) and `instructions`. Choice
  and Score require `criteria`; Noul's `criteria` is optional.
  — <https://docs.typesafe.ai/primitives>
- `instructions` can be a `string`, `object`, or `array`. An object can hold the question in
  one field and the data it refers to in others; refer to data fields by name in backticks.
  — <https://docs.typesafe.ai/api>
- Verbatim example request:
  ```json
  {
    "state": "Help! My payouts have been failing for 3 days.",
    "model": "jev-latest",
    "questions": {
      "is_urgent": {
        "type": "noul",
        "instructions": "Does this convey urgency?"
      }
    }
  }
  ```
  — <https://docs.typesafe.ai/api>

### Response shape (shared by all three)

- Three required top-level fields: `model` (the versioned ID that answered, e.g.
  `"jev-1.13.0"`), `answers` (`map<string, Answer>` keyed by the request's question ids),
  and `usage` (`{ input_tokens, output_tokens }`).
  — <https://docs.typesafe.ai/api>
- Every answer carries a `type` matching its question. Choice and Score answers also carry
  `confidence` (0 to 1). Noul answers do not.
  — <https://docs.typesafe.ai/api>

### Choice

- Picks one option from a set you define. `criteria` is a map of option name to description
  (`string | object | array | null`); `null` means no extra description. Maximum 255 options
  per Choice. — <https://docs.typesafe.ai/api>
- Answer fields: `choice` (highest-probability option), `probabilities` (every option mapped
  to a float; floats sum to 1), `confidence`. — <https://docs.typesafe.ai/api>
- Verbatim example response:
  ```json
  {
    "model": "jev-1.13.0",
    "answers": {
      "department": {
        "type": "choice",
        "choice": "billing",
        "probabilities": { "billing": 0.88, "technical": 0.12, "sales": 0.0 },
        "confidence": 0.81
      }
    },
    "usage": { "input_tokens": 318, "output_tokens": 34 }
  }
  ```
  — <https://docs.typesafe.ai/api>
- Option names and descriptions are both sent to the model. The docs recommend adding an
  `other` or `none of the above` option when the list might not cover every input.
  — <https://docs.typesafe.ai/primitives/choice>
- A Choice is relative: it settles *which* option. One Noul per option is absolute and can
  be low for all of them. — <https://docs.typesafe.ai/model-jaggedness/jev-1.13>

### Score

- Rates the state along an ordered rubric. `criteria` is an ordered array of level
  descriptions (`string | object | array`), low end first. At least two levels; the API
  accepts up to 10. — <https://docs.typesafe.ai/api>
- A level's number is its position in the array, starting at 0. The model gets the
  descriptions and nothing else; each level is judged on its own against the state, and the
  model does not see a level's number or its neighbours.
  — <https://docs.typesafe.ai/primitives/score>
- Answer fields: `score` (probability-weighted mean of the level numbers, so it can land
  between levels), `legend` (level number to description), `probabilities` (level number as
  string key to float; sum to 1), `confidence`. — <https://docs.typesafe.ai/api>
- Verbatim example response:
  ```json
  {
    "model": "jev-1.13.0",
    "answers": {
      "frustration": {
        "type": "score",
        "score": 1.05,
        "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
        "probabilities": { "0": 0.0, "1": 0.95, "2": 0.05 },
        "confidence": 0.92
      }
    },
    "usage": { "input_tokens": 304, "output_tokens": 18 }
  }
  ```
  — <https://docs.typesafe.ai/api>
- Different distributions can produce the same score (1.0 can be all probability on level 1,
  or half on each of 0 and 2); the docs say to read `probabilities` and `confidence`
  alongside it. — <https://docs.typesafe.ai/primitives/score>
- The docs say to describe situations, not degrees ("Broken or degraded feature, but
  workaround exists" rather than "Moderately severe"), and show that numeric-only levels
  (`["0", "1", "2"]`) split probability instead of placing the state.
  — <https://docs.typesafe.ai/primitives/score>
- Keep each Score to one dimension; a description like "punctual and smart and experienced"
  measures three things and confidence drops. Split into one Score per thing and combine in
  code. — <https://docs.typesafe.ai/primitives/score>
- Do not use score outputs to compute an exact magnitude between two levels; thresholding
  on the expectation is fine, interpolation is not.
  — <https://docs.typesafe.ai/model-jaggedness/jev-1.13>

### Noul

- A yes/no question. Returns `noul`, the probability that the answer is yes, 0 (no) to 1
  (yes). `criteria` is optional: an object with `true` and `false` descriptions
  (`string | object | array`). — <https://docs.typesafe.ai/api>
- Verbatim example request with criteria:
  ```json
  {
    "state": "Help! My payouts have been failing for 3 days.",
    "model": "jev-latest",
    "questions": {
      "is_urgent": {
        "type": "noul",
        "instructions": "Does this convey urgency?",
        "criteria": {
          "true": "Explicitly time-sensitive",
          "false": "No urgency expressed"
        }
      }
    }
  }
  ```
  — <https://docs.typesafe.ai/api>
- Verbatim example response: `{ "type": "noul", "noul": 0.95 }` under the question id.
  — <https://docs.typesafe.ai/api>
- No separate `confidence`: a Noul's distribution has only two outcomes, so the single value
  describes it completely. — <https://docs.typesafe.ai/primitives/noul>
- A Noul value is the probability that the answer is yes, not a scale of the thing asked
  about; 0.5 means yes and no are equally likely, not "medium".
  — <https://docs.typesafe.ai/primitives>
- The docs' guidance: one yes/no condition per Noul; phrase so a high value means yes; a
  statement works as well as a question; add `criteria` when the boundary is subtle.
  — <https://docs.typesafe.ai/primitives/noul>
- Recorded `jev-1.13.0` answers to "Is the customer asking for a human agent?": "Thanks,
  that fixed it!" 0.02; "Are you a bot?" 0.40; "I have asked three times now. Can I please
  just talk to a real person?" 0.99. — <https://docs.typesafe.ai/primitives/noul>

### Advanced structure

- `instructions` (all three types), Choice option descriptions, Score level descriptions,
  and Noul `criteria.true` / `criteria.false` all accept `string`, `object`, `array`, or
  `null`. Every one is the SDK's `EntryType`.
  — <https://docs.typesafe.ai/primitives/advanced>
- The field names inside a structured object (`question`, `focus`, `what`, `not_for`,
  `examples`, and so on) are not part of the API and none are reserved. The model sees the
  names along with the values. — <https://docs.typesafe.ai/primitives/choice>
- Verbatim structured Choice criteria (option rubric with what / not_for / examples):
  ```js
  criteria: {
    billing: {
      what: 'Charges, invoices, refunds, or subscriptions',
      not_for: 'Order tracking or account access',
      examples: ['I was charged twice', 'Where is my refund?'],
    },
    orders: {
      what: 'Order status, delivery, cancellation, or returns',
      not_for: 'Charges or account access',
      examples: ['Where is my package?', 'Cancel my order'],
    },
    account: {
      what: 'Login, password, profile, or security',
      not_for: 'Charges or delivery',
      examples: ["I can't log in", 'Change my email'],
    },
  },
  ```
  — <https://docs.typesafe.ai/primitives/advanced>
- Verbatim structured Score level (summary + signals):
  ```js
  criteria: [
    {
      summary: 'One change, clearly stated',
      signals: ['A single fix or feature', 'Nothing described as "also" or "while I was in there"'],
    },
    {
      summary: 'One main change plus a small related tweak',
      signals: ['A primary change and one minor adjacent edit', 'The tweak supports the main change'],
    },
    {
      summary: 'Several independent changes bundled together',
      signals: ['Two or more unrelated fixes or features', 'Changes that could each be their own PR'],
    },
  ],
  ```
  — <https://docs.typesafe.ai/primitives/advanced>
- Verbatim structured Noul criteria:
  ```js
  criteria: {
    true: {
      what: 'Asks the recipient to reply with, type, or send a password, PIN, one-time code, or other security sensitive answer',
      examples: ['Reply with your password', 'Send us the 6-digit code you just received'],
    },
    false: {
      what: 'No sensitive credential is requested',
      examples: ['Reset your password from the settings page', 'Your statement is ready'],
    },
  },
  ```
  — <https://docs.typesafe.ai/primitives/advanced>
- Walking a taxonomy: ask one Choice per level, where each option's value is the child's
  subtree, and repeat in code until a leaf. If a branch is too large, trim the value to its
  direct children and a sample of leaves. — <https://docs.typesafe.ai/primitives/advanced>
- The Score page shows the effect of examples on the Safari bug report: plain strings
  scored 1.43 at confidence 0.35; adding a matching example ("export fails in one browser
  but works in another") gave 1.03 at 0.96; an unrelated example gave the same 1.43 / 0.35
  as plain strings. — <https://docs.typesafe.ai/primitives/score>

### How `state` is supplied

- `state` is the `state` field of the request: a plain string, a JSON object, or an array.
  The docs recommend an object for most requests so each part has a descriptive name.
  — <https://docs.typesafe.ai/concepts/state>
- Text only. No image, audio, or video input; pre-process those into text or structured
  fields first. — <https://docs.typesafe.ai/models>
- In the JS SDK, `state: EntryType`, i.e. `string | { [key: string]: JsonValue } |
  JsonValue[] | null`. — <https://docs.typesafe.ai/sdk/javascript/api/interfaces/SystemOneRequest>
- To point a question at part of a structured state, name the path in `instructions` with
  backticks, e.g. ``Does `ticket.messages[0].text` request a refund?``.
  — <https://docs.typesafe.ai/primitives>
- English is the primary training language and where accuracy is best; other languages,
  including CJK scripts, are accepted with lower accuracy. — <https://docs.typesafe.ai/models>

### Size limits on state

- Context length: 64k tokens per request; 32k tokens for `state` plus the longest question.
  The 64k budget covers the `state` plus all questions combined; the 32k budget applies to
  the `state` plus the single longest question. — <https://docs.typesafe.ai/models>
- Accuracy falls as the state grows with content unrelated to the decision ("context rot");
  the docs say to filter in code first and send only what the question needs.
  — <https://docs.typesafe.ai/model-jaggedness/jev-1.13>
- One cookbook sends a ~54,000-character Wikipedia article as state in one request.
  — <https://docs.typesafe.ai/cookbooks/parallel_questions>

### How many questions one call takes

- No documented maximum count of questions per request. The only stated bound is the token
  budget above (64k for state plus all questions).
  — <https://docs.typesafe.ai/models>
- Every question in a request sees the same state, is evaluated independently and in
  parallel, and returns under its own id. Types can be mixed freely.
  — <https://docs.typesafe.ai/primitives>
- Jev ingests the `state` once and evaluates every question against it in parallel. Adding
  questions "barely changes the response time and costs only the tokens for the extra
  questions". — <https://docs.typesafe.ai/models>, <https://docs.typesafe.ai/primitives>
- Questions in one request are independent: one answer is not context for another. A
  second request is needed only when code cannot build it until it has the first answer.
  — <https://docs.typesafe.ai/primitives>
- Documented single-request sizes: 13 questions over one article
  (<https://docs.typesafe.ai/cookbooks/parallel_questions>); a Choice over 218 line ids plus
  a Noul (<https://docs.typesafe.ai/cookbooks/semantic_find>); a Choice over 182 skills
  (<https://docs.typesafe.ai/cookbooks/skill_suggestion>).

## The JavaScript SDK `@typesafe-ai/sdk`

### Install, versions, Node

- `npm install @typesafe-ai/sdk`; requires Node.js 20 or newer.
  — <https://docs.typesafe.ai/sdk/javascript>
- npm `latest` is `0.6.0`, published 2026-09-15. Published versions: `0.0.0-bootstrap.0`,
  `0.5.7`, `0.6.0`. `engines.node` is `>=20`. License MIT. No runtime `dependencies`.
  Ships ESM (`dist/index.mjs`), CommonJS (`dist/index.cjs`), and TypeScript declarations.
  Repository `github.com/typesafe-ai/typesafe-sdk-js`.
  — <https://www.npmjs.com/package/@typesafe-ai/sdk> (registry metadata read 2026-10-01)
- Changelog: v0.6.0 (2026-09-15) breaking change, `Score.criteria` is an ordered sequence
  instead of a dictionary keyed by integers; v0.5.7 (2026-09-11) initial public release.
  — <https://docs.typesafe.ai/sdk/javascript/changelog>

### Client setup

- `new TypeSafeClient(config?)`. Explicit options take precedence over environment
  variables, then SDK defaults. Empty or whitespace-only env values are ignored.
  — <https://docs.typesafe.ai/sdk/javascript/api/classes/TypeSafeClient>
- Config fields and fallbacks: `apiKey` (env `TYPESAFE_API_KEY`, required); `baseURL` (env
  `TYPESAFE_BASE_URL`, then `https://api.typesafe.ai`); `defaultModel` (env
  `TYPESAFE_DEFAULT_MODEL`, then `jev-latest`); `logLevel` (env `TYPESAFE_LOG_LEVEL`, then
  `warn`; `debug` logs headers and bodies, bodies are not redacted); `logger` (default
  prefixed `console`); `retry` (`Partial<RetryPolicy>`); `timeout` (per attempt, ms,
  default 10000, no total retry budget); `defaultHeaders`; `dangerouslyAllowBrowser`
  (default false); `fetch` (default global `fetch`).
  — <https://docs.typesafe.ai/sdk/javascript/api/interfaces/TypeSafeClientConfig>
- The constructor throws `TypeSafeError` when the API key is missing, configuration is
  invalid, the runtime is a browser without `dangerouslyAllowBrowser`, or no global `fetch`
  exists and none was passed.
  — <https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/client.ts>
- `client.systemOne(request, options?)` returns `APIPromise<SystemOneResult<Q>>`; `request`
  is `{ state, questions, model? }`; `options` is `{ signal?, timeout?, retry?, headers? }`.
  — <https://docs.typesafe.ai/sdk/javascript/api/classes/TypeSafeClient>
- `client.models.list()` returns `ModelCard[]` (`name`, `description`, `release_date`).
  — <https://docs.typesafe.ai/sdk/javascript/api/interfaces/Models>
- Answer types are inferred from the questions: `answers` is
  `{ [K in keyof Q]: ResultFor<Q[K]> }`, so `answers.category.choice` is typed as the union
  of that question's option keys. — <https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/types.ts>

### Verbatim TypeScript examples

- Choice (the quickstart):
  ```ts
  import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

  const client = new TypeSafeClient();
  const response = await client.systemOne({
    state: { document: "I was charged twice. Please fix this ASAP." },
    questions: {
      category: choice("What is this ticket about?", {
        billing: null,
        technical: null,
        other: null,
      }),
    },
  });

  console.log(response.answers.category.choice);
  ```
  — <https://docs.typesafe.ai/sdk/javascript>
- Noul (the `systemOne` reference example):
  ```ts
  const { answers } = await client.systemOne({
    state: "I was charged twice. Please help.",
    questions: { billing: noul("Is this about billing?") },
  });
  console.log(answers.billing.noul);
  ```
  — <https://docs.typesafe.ai/sdk/javascript/api/classes/TypeSafeClient>
- Score: the docs contain no verbatim TypeScript Score example. The documented builder
  signature is:
  ```ts
  function score<T>(instructions, criteria): ScoreQuestion<T>;
  ```
  where `instructions` is `EntryType` and `criteria` is "at least two descriptions indexed
  by score from zero; entries may be `null`" (`ScoreCriteria = readonly [EntryType,
  EntryType, ...EntryType[]]`). — <https://docs.typesafe.ai/sdk/javascript/api/functions/score>,
  <https://docs.typesafe.ai/sdk/javascript/api/type-aliases/ScoreCriteria>
- Models list (verbatim JavaScript):
  ```ts
  import { TypeSafeClient } from "@typesafe-ai/sdk";

  const client = new TypeSafeClient();
  const models = await client.models.list();
  for (const model of models) {
    console.log(model.name, model.release_date, model.description);
  }
  ```
  — <https://docs.typesafe.ai/models>
- Builder signatures: `choice<T>(instructions, criteria): ChoiceQuestion<T>`;
  `noul(instructions?, criteria?): NoulQuestion` (instructions defaults to `null`).
  — <https://docs.typesafe.ai/sdk/javascript/api/functions/choice>,
  <https://docs.typesafe.ai/sdk/javascript/api/functions/noul>
- Questions can also be written as plain objects (`{ type: "choice", instructions,
  criteria }` etc.) since `Questions` is `{ [name: string]: Question }`.
  — <https://docs.typesafe.ai/sdk/javascript/api/interfaces/Questions>

### Response types

- `ChoiceResponse<T>`: `type: "choice"`, `choice: keyof T & string`, `confidence: number`,
  `probabilities` keyed by label.
  — <https://docs.typesafe.ai/sdk/javascript/api/interfaces/ChoiceResponse>
- `ScoreResponse<T>`: `type: "score"`, `score: number`, `confidence: number`, `legend`
  keyed by score, `probabilities` keyed by score (a number or its string form).
  — <https://docs.typesafe.ai/sdk/javascript/api/interfaces/ScoreResponse>
- `NoulResponse`: `type: "noul"`, `noul: number`.
  — <https://docs.typesafe.ai/sdk/javascript/api/interfaces/NoulResponse>
- `SystemOneResult<Q>`: `answers`, `model: string`, `usage: { input_tokens, output_tokens }`.
  — <https://docs.typesafe.ai/sdk/javascript/api/interfaces/SystemOneResult>

### Error behaviour

- Class tree: `TypeSafeError` (base, extends `Error`) with `APIConnectionError` (DNS, TLS,
  connection closed; `APITimeoutError` is a subclass with `timeoutMs`), `APIError` (any
  non-2xx; `status`, `body`, `headers`, `requestId` from `x-typesafe-request-id`), and
  `APIUserAbortError`. `APIError` subclasses: `AuthenticationError`, `BadRequestError`,
  `InternalServerError`, `NotFoundError`, `PermissionDeniedError`, `RateLimitError` (429,
  adds `retryAfterMs`), `UnprocessableEntityError` (422).
  — <https://docs.typesafe.ai/sdk/javascript/api>
- `systemOne` throws `TypeSafeError` before sending when questions are empty or a Score's
  criteria is not a list of at least two entries; `APIError` on a non-2xx response after
  retries; `APIConnectionError` when the request cannot connect or times out after retries;
  `APIUserAbortError` when the caller aborts.
  — <https://docs.typesafe.ai/sdk/javascript/api/classes/TypeSafeClient>
- `score()` throws if criteria is not an array; `choice()` throws if criteria is an array.
  — <https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/questions.ts>
- HTTP API errors: `401` missing or invalid key; `422` request body failed validation (body
  names the field); `429` rate limit exceeded; `529` TypeSafe temporarily overloaded.
  — <https://docs.typesafe.ai/api>

### Retry behaviour

- Default `RetryPolicy`: `maxRetries` 2 (after the initial attempt; 0 disables);
  `backoffInitialMs` 500, doubled up to `backoffMaxMs` 5000; `backoffJitter` 0.25 (fraction
  randomly subtracted); `httpStatuses` 408, 429, and 500–599; `respectRetryAfter` true
  (honours `Retry-After` and `retry-after-ms` up to `maxRetryAfterMs` 60000, longer delays
  fall back to backoff); `apiConnectionError` true; `apiTimeoutError` true.
  — <https://docs.typesafe.ai/sdk/javascript/api/interfaces/RetryPolicy>
- Retry overrides can be set per client (`retry`) or per call (`options.retry`); omitted
  fields inherit. — <https://docs.typesafe.ai/sdk/javascript/api/interfaces/RequestOptions>
- Timeout is per attempt with no total retry budget.
  — <https://docs.typesafe.ai/sdk/javascript/api/interfaces/TypeSafeClientConfig>
- Retried attempts carry an `X-TypeSafe-Retry-Count` header; the SDK sends
  `User-Agent: typesafe-sdk/<VERSION>` and `X-TypeSafe-SDK`.
  — <https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/client.ts>
- The HTTP docs' instruction for direct callers: on `429` or `529`, retry with exponential
  backoff; the SDKs do this automatically. — <https://docs.typesafe.ai/api>

## Confidence

- `confidence` is a single number from 0 to 1 derived from the shape of `probabilities`:
  concentrated on one option or level means high, spread out means low. Returned on every
  Choice and Score answer; Noul answers do not carry one.
  — <https://docs.typesafe.ai/confidence>
- The docs call it "a solid default" but not the only possible measure; the full
  `probabilities` are returned so code can compute its own.
  — <https://docs.typesafe.ai/confidence>
- Low confidence on a Choice often means no option is a clear winner; on a Score, that the
  levels are ambiguous or multi-dimensional, or the state does not say enough.
  — <https://docs.typesafe.ai/confidence>
- Confidence 1.0 "describes the model's answer, not a guarantee that the answer is
  correct". — <https://docs.typesafe.ai/primitives/score>
- Three paths: high confidence act automatically; medium proceed with caution (confirm,
  flag, gather more); low do not act (route to a human, clarify, fall back). Boundaries
  depend on the stakes. — <https://docs.typesafe.ai/confidence>
- Thresholds scale with risk: different actions in one system gate at different levels.
  Example thresholds in the docs: a 0.5 floor below which the model is "genuinely unsure";
  above 0.9 for a high-stakes action. "Start with conservative thresholds, test with your
  own data, and adjust." — <https://docs.typesafe.ai/confidence>
- Confidence-gated routing pattern: a Choice `intent` question plus code that routes below
  0.6 confidence to a human; acts on a low-stakes intent at 0.6 or above; and for a
  high-stakes intent acts automatically above 0.85 but asks the user to confirm between 0.6
  and 0.85. — <https://docs.typesafe.ai/patterns/confidence-routing>
- Verbatim routing code from that pattern (Python):
  ```python
  action = response.answers["intent"]

  # Below 0.6 confidence on any action, route to a human
  if action.confidence < 0.6:
      route_to_support_agent(account_id)

  elif action.choice == "check_balance":
      # Low stakes. 0.6 confidence is sufficient.
      show_balance(account_id)

  elif action.choice == "approve_transfer":
      if action.confidence > 0.85:
          # High stakes, but high confidence. Safe to act automatically.
          approve_transfer(account_id)
      else:
          # High stakes, moderate confidence. Verify intent first.
          ask_user_to_confirm("Just to confirm: you would like to approve this transfer, is that correct?")

  else:
      route_to_support_agent(account_id)
  ```
  — <https://docs.typesafe.ai/patterns/confidence-routing>
- Intent routing pattern: intent confidence below 0.5 goes to a human; a companion Score
  `complexity` has its own confidence check (`< 0.5`) and threshold (`> 1`) before an LLM
  handles a complaint. — <https://docs.typesafe.ai/patterns/intent-routing>
- Thresholds do not transfer across question types: a threshold tuned on a Noul should not
  be carried to a Choice. — <https://docs.typesafe.ai/model-jaggedness/jev-1.13>
- The agent-skill page's note: if all you need is the best option, pick the highest
  probability rather than thresholding on confidence; for a specific statistical algorithm,
  use `probabilities`. — <https://docs.typesafe.ai/agent-skill>

## Pricing, rate limits, latency, jaggedness

### Pricing

- Jev 1.13: $42 per Btok (billion tokens), $0.042 per Mtok (million tokens). Charged per
  input token; output tokens are free. — <https://docs.typesafe.ai/models>
- Documented per-request `usage` figures from the docs' own examples: one Noul on a short
  sentence, 296 to 307 input tokens; three questions (Choice + Score + Noul) on a two-line
  ticket, 392 input / 65 output; five Choice questions on a three-line ticket, 589 input /
  212 output. — <https://docs.typesafe.ai/api>, <https://docs.typesafe.ai/introduction/quickstart>,
  <https://docs.typesafe.ai/primitives/choice>
- Cookbook cost readings at that rate: 13 questions over a ~54,000-character article in one
  call, $0.000497 per call; the same 13 as separate calls, $0.006090 (12.2x more).
  — <https://docs.typesafe.ai/cookbooks/parallel_questions>
- An 8-Choice moderation rubric over one post: $0.000046 per TypeSafe call versus $0.000936
  to $0.041255 per call for the LLM conditions in that run.
  — <https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook>
- Higher limits and zero data retention are on custom and enterprise plans via
  sales@typesafe.ai. — <https://docs.typesafe.ai/models>, <https://docs.typesafe.ai/legal>
- Jev is not trained on customer requests or responses; DPA, MCA, and Privacy Policy are
  linked from the Legal page. — <https://docs.typesafe.ai/models>, <https://docs.typesafe.ai/legal>

### Rate limits

- Jev 1.13: 100K tokens per second / 40 requests per second. Exceeding either returns
  `429 Too Many Requests`. — <https://docs.typesafe.ai/models>
- Warning on the same page: limits "are adjusting dynamically" and "can change without
  notice" while TypeSafe serves a large volume of demand.
  — <https://docs.typesafe.ai/models>
- One cookbook, written against `jev-1.12` on 2026-08-11, caps its thread pool at 6 with
  the comment "the public endpoint rate-limits above roughly eight".
  — <https://docs.typesafe.ai/cookbooks/entity_alignment>

### Latency figures (cookbook measurements, not SLAs)

- 8-Choice moderation rubric, 15 calls, `jev-latest` on the production API on 2026-09-11:
  mean round-trip 114 ms per call.
  — <https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook>
- 15-Noul insurance rubric, 15 calls: mean round-trip 111 ms per call.
  — <https://docs.typesafe.ai/cookbooks/consistency_noul_cookbook>
- 13 questions over a ~54,000-character article, `jev-1.12`: 0.27 s per batched call; the
  13 single-question calls summed to 2.71 s.
  — <https://docs.typesafe.ai/cookbooks/parallel_questions>
- The docs' general claim: adding questions "barely changes the response time" because they
  run in parallel. — <https://docs.typesafe.ai/primitives>
- Cookbooks construct the Python client with `timeout=120.0`; the JS SDK default is 10 s per
  attempt. — <https://docs.typesafe.ai/cookbooks/citation_check>,
  <https://docs.typesafe.ai/sdk/javascript/api/interfaces/TypeSafeClientConfig>

### Jaggedness notes for `jev-1.13` (last reviewed 2026-09-17)

- Nine listed failure modes: literal reading; math and numbers (counting, numeric
  representations, score arithmetic); date and time comparison; indirection; large state
  full of irrelevant detail; adversarial content; contradictory instructions and criteria;
  common-sense structural invariants; generation.
  — <https://docs.typesafe.ai/model-jaggedness/jev-1.13>
- Literal reading: it answers the question as written; scoping words, negations, and
  implied conditions are read at face value. Put boundary cases in the criteria.
- Counting is unreliable; count in code by asking one Noul per item and summing.
- Semantic representations outperform numeric ones (colour names over hex values; high-level
  languages over assembly).
- Dates are read as text, not ordered quantities; extract parts as Choices and compare in
  code.
- Double negatives and multi-hop questions cost accuracy; point to the relevant state by
  name.
- State is data and not treated as hostile by default; injected instructions or text that
  argues for its own classification can move the answer.
- A Noul whose `true` maps to no will perform worse; align criteria with the instruction.
- Structural invariants are not guaranteed: the same question as a Noul (0.22) and as a
  yes/no Choice (`yes` 0.01, `no` 0.99, confidence 0.97) gave different numbers; a Noul and
  its negation summed to 1.19.
- Not trained to generate text; turn extraction into a Choice over bounded options.
- The page's reminder list: avoid asking what code can compute exactly, hiding several
  judgments in one question, System Two tasks, and more `state` than the question needs.
- Model behaviour notes elsewhere: Jev is not fine-tuned or LoRA-adapted with customer
  data; the same weights serve every account; it is "extremely consistent" for semantically
  similar inputs. — <https://docs.typesafe.ai/models>,
  <https://docs.typesafe.ai/model-jaggedness/jev-1.13>
- Aliases move on new releases; to keep tuned thresholds stable, pin the versioned ID
  (`jev-1.13.0`) and log the response's `model` field. — <https://docs.typesafe.ai/models>

## Documented cookbooks and patterns matching the pipeline's candidate uses

### Triaging a playtest note or issue into engine, balance, or UI

- Speculative fan-out pattern: a support ticket triage with a Choice `category` (bug_report,
  billing, feature_request, account) plus speculative Score `bug_severity`, Noul
  `has_reproducible_steps`, Noul `refund_requested`, and Score `frustration`, all in one
  request; code reads only the answers relevant to the chosen category.
  — <https://docs.typesafe.ai/patterns/fan-out>
- Intent routing pattern: a Choice `intent` plus a Score `complexity`; intent confidence
  below 0.5 goes to a human; each intent routes to deterministic code, a specialist LLM, or
  a human. — <https://docs.typesafe.ai/patterns/intent-routing>
- Choice page's five-question triage: `department`, `return_reason`, `shipping_issue`,
  `requested_resolution`, `tone` in one call; code sends low-confidence department answers
  (< 0.3) to manual triage and copies a second team any option with probability > 0.25.
  — <https://docs.typesafe.ai/primitives/choice>
- Classification using confidence cookbook: 60 SEC filings into 75 industry groups with one
  Choice each; at a 0.9 confidence cutoff the confident half was right 90% of the time, the
  other half 40%, which rose to 70% when reported one level up the hierarchy.
  — <https://docs.typesafe.ai/cookbooks/classification_using_confidence>
- Self-consistency: choices cookbook: an 8-Choice moderation rubric run 15 times; with a
  top-probability floor of 0.60 (below it the result is `uncertain` and goes to review),
  TypeSafe's label agreement was 99.2% with automatic labels on 74.2% of answers.
  — <https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook>
- Structured Choice criteria with `what`, `not_for`, and `examples` fields sharpen the
  boundary between confusable categories.
  — <https://docs.typesafe.ai/primitives/advanced>

### Scoring a proposed card for rule ambiguity and interaction footprint

- Composite scoring pattern: break a judgment into independent Score dimensions, normalize
  each to 0–1 by dividing by its top level number, combine with weights in code.
  — <https://docs.typesafe.ai/patterns/composite-scoring>
- Score page's three-Score ticket priority: `severity`, `frustration`, `report_quality`
  normalized and weighted 0.6 / 0.3 / 0.1. — <https://docs.typesafe.ai/primitives/score>
- Structured Score levels with `summary` and `signals` (the PR-scope example judges "the
  number of independent changes, not the size of any one change").
  — <https://docs.typesafe.ai/primitives/advanced>
- Knowledge graph entity alignment cookbook: one three-level Score (different / related but
  possibly not the same / same) rounded to the nearest level, plus three companion Nouls in
  the same request that tell a curator which fields disagree; chosen over a Noul because the
  middle level carries its own semantic label and over a Choice to keep the order.
  — <https://docs.typesafe.ai/cookbooks/entity_alignment>
- Guardrails for LLMs cookbook: a battery of Nouls (one per hazard) plus one Score for
  severity in one request; thresholds in code decide pass / review / block / route.
  — <https://docs.typesafe.ai/cookbooks/llm_guardrails>
- Jaggedness: a Score is "weak in numerical calibration" between levels; threshold on the
  expectation, do not interpolate a magnitude.
  — <https://docs.typesafe.ai/model-jaggedness/jev-1.13>

### Answering whether a run's narration shows a given event

- Double-checking citations cookbook: state is `{"claim": ..., "section": ...}`; one
  Choice `relation` with options `supports`, `contradicts`, `says_nothing`; verdicts below
  confidence 0.8 go to a human. On eight citations against RFC 7519 the four accurate ones
  came back `verified` at confidence 0.93 or higher and all four planted failures were
  caught. — <https://docs.typesafe.ai/cookbooks/citation_check>
- Verbatim question from that cookbook (Python):
  ```python
  "relation": Choice(
      instructions="How does the section relate to the claim?",
      criteria={
          "supports": "The section states the claim or directly implies that it is true",
          "contradicts": "The section states the opposite of the claim or implies it is false",
          "says_nothing": "The section does not address what the claim asserts, either way",
      },
  ),
  ```
  — <https://docs.typesafe.ai/cookbooks/citation_check>
- Line-by-line search cookbook: each line of a document is prefixed with an id (`L052| ...`);
  one Choice over the 218 line ids ranks which line answers a query, and a Noul in the same
  request checks whether the document contains an answer at all, because Choice
  probabilities always sum to 1 and a line ranks first even when none answers.
  — <https://docs.typesafe.ai/cookbooks/semantic_find>
- Verbatim existence question from that cookbook (Python):
  ```python
  Noul(
      instructions=f'Does any line of the document address or answer: "{query}"?',
      criteria=NoulCriteria(
          true="At least one line of the document states or directly implies the answer",
          false="No line of the document addresses this",
      ),
  )
  ```
  — <https://docs.typesafe.ai/cookbooks/semantic_find>
- Parallel questions cookbook: 13 questions (8 Noul, 2 Choice, 3 Score) over one ~54,000-
  character document in one request; answers were identical whether batched or sent one per
  call (most with run-to-run std dev 0.0 over 5 repeats).
  — <https://docs.typesafe.ai/cookbooks/parallel_questions>
- Jaggedness: counting occurrences in a passage is unreliable; the documented alternative is
  one Noul per candidate item summed in code.
  — <https://docs.typesafe.ai/model-jaggedness/jev-1.13>

## Not established

- A documented maximum number of questions per request. Only the 64k / 32k token budgets
  are stated. — <https://docs.typesafe.ai/models>
- A maximum size for `state` in bytes or characters; only the token budgets above.
- Any latency SLA, p50/p95, or per-request latency figure outside the cookbook measurements
  listed above. The docs do not publish one.
- Whether rate limits are per account, per key, or per organization; the Models page gives
  the two figures and says they change without notice.
- A free tier, trial credits, minimum spend, or billing cadence. The docs state only the
  per-token rate and point to sales for custom plans.
- A verbatim TypeScript example for a Score question. The docs give the `score()` signature
  and type aliases but no runnable TS Score snippet; the only verbatim TS snippets are the
  Choice quickstart, the Noul `systemOne` example, and the models list.
- How `confidence` is computed from `probabilities` (the formula). The Confidence page says
  it is a statistic of the distribution's shape and defers the comparison of measures to a
  future cookbook. — <https://docs.typesafe.ai/confidence>
- Behaviour on `state: null` beyond the type allowing it; no docs page describes a request
  with null state. — <https://docs.typesafe.ai/sdk/javascript/api/interfaces/SystemOneRequest>
- Whether `529 Overloaded` carries a `retry-after` header; the API page says to back off and
  the JS SDK retries all 5xx by default.
- Deno, Bun, or edge-runtime support for the JS SDK; the docs state Node.js 20 or newer and
  that browser use is refused unless `dangerouslyAllowBrowser` is set.
