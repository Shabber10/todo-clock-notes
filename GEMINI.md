# Anti-Hallucination & Code Reliability Rules

These rules are strictly enforced for all AI agent interactions and code generation tasks in this workspace:

## 1. Zero Hallucination Policy
- **Verify Dependencies**: Do not import or invoke packages, modules, or dependencies that are not explicitly installed or defined in project manifests (e.g., `package.json`, `requirements.txt`).
- **No Guessed APIs**: If the signature, parameter list, or behavior of an external library is uncertain, verify it first using local documentation, source definitions, or web search. Do not invent convenience methods or fields.
- **Inspect Before Creating**: Always check existing codebase directories and utility files before writing new functions to prevent redundant or duplicate implementations.

## 2. Mandatory Verification & Self-Correction
- **Check Diagnostics**: Immediately inspect IDE compiler, linter, and type-checker warnings after making code edits.
- **Run Tests & Builds**: Whenever applicable, run local tests or build commands (`npm run build`, `npm test`, `pytest`) to validate that the changes execute without errors before reporting completion.
- **Fix Immediate Breakages**: If a proposed edit triggers diagnostic errors or missing symbol warnings, fix the cause immediately rather than leaving placeholders or `// TODO` comments.

## 3. Transparency & Direct Grounding
- **Acknowledge Limitations**: If requirements are ambiguous, clarify questions or suggest `/plan` or `/grill-me` instead of assuming or making up specifications.
- **Preserve Existing Code**: Do not remove existing comments, docstrings, or functionality unless explicitly instructed.
