# AGENTS.md
# Global workspace rules

## Scope

This file applies to all projects inside this workspace unless a deeper AGENTS.md overrides it.

## Context economy

- Work only inside the current project folder.
- Do not read unrelated sibling projects.
- Ignore generated or dependency folders:
  - node_modules
  - dist
  - build
  - .next
  - target
  - coverage
  - .git
- Prefer reading:
  1. nearest AGENTS.md
  2. package.json / pom.xml / README.md
  3. files directly relevant to the task

## Interaction rules

- If the user message ends with "?", answer only. Do not edit files.
- If the task is unclear, ask one concrete question.
- Before editing, state a short plan.
- Make minimal changes.
- Do not refactor unrelated code.
- Do not create commits unless explicitly requested.

## After changes

- Summarize what was changed.
- List changed files.
- Run the smallest relevant verification command.
- If verification was not run, explain why.