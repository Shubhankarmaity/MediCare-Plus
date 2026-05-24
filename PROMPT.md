# 🤖 AI Prompt Guide: MediCare Plus

This document acts as the master instruction layer for all future AI agents (Codex, Cursor, Claude, Gemini, Copilot, Antigravity, etc.) interacting with the **MediCare Plus** repository.

---

## 📌 Context Loading Order

Before writing code or proposing changes, **you must read the following files in sequence**:
1.  [AI_CONTEXT.md](file:///D:/project/Hospital/AI_CONTEXT.md): For system-wide stack, conventions, and runtime setups.
2.  [PROJECT_STATE.md](file:///D:/project/Hospital/PROJECT_STATE.md): For current session status, backlog, and blockers.
3.  [docs/system_overview.md](file:///D:/project/Hospital/docs/system_overview.md): To understand multi-service topology.
4.  [docs/architecture.md](file:///D:/project/Hospital/docs/architecture.md): To study boundaries, middleware, and request flow pipelines.
5.  **Relevant Feature Files**: Review the schemas in `server/models/` and router endpoints in `server/routes/` for the target domain.

---

## 📐 AI Agent Workflow Rules

1.  **Analyze Before Editing**: Never modify a file without mapping its dependencies. Perform search operations or view target methods first.
2.  **Avoid Unnecessary Refactors**: Do not rewrite working controllers or UI designs. Prioritize adding features, fixing specific bugs, or enhancing documentation.
3.  **Preserve Architecture**: Maintain standard boundaries. Keep Express routers separate from Mongoose models and controller actions. Keep React pages decoupled from raw component widgets.
4.  **Maintain Backward Compatibility**: Ensure new REST payloads do not break existing frontend structures. If schema fields change, check database seeders.
5.  **Update Documentation**: If you add new schemas, endpoints, or scripts, immediately document them in `docs/` and update `PROJECT_STATE.md`.

---

## ✏️ Code Generation Rules

*   **Modular Architecture**: Write small, focused classes and utilities. Do not exceed 800 lines of code in a single file unless absolutely necessary.
*   **Naming Consistency**:
    *   **Backend**: CamelCase for routes, `_id` suffix for DB references, lowercase directories.
    *   **Frontend**: PascalCase for React components and JSX pages, camelCase for local methods.
*   **Asynchronous Pattern**: Use standard `async/await` syntax. Always wrap asynchronous blocks in a robust `try-catch` structure with clean logging.
*   **Rigorous Validations**: Never trust client inputs. Always check body properties inside backend routers (e.g. check string lengths, empty inputs, type matches) before committing them to database query pipelines.
*   **Graceful Failures**: Return clean JSON responses on backend failures (e.g. `{ error: "Description" }`) and use React toast triggers (`react-hot-toast`) on frontend API errors.

---

## 🚫 Forbidden Actions

*   **Do NOT Remove Auth Middleware**: Never expose a medical history, vitals, or appointment route by removing the `auth` middleware from `server/routes/`.
*   **Do NOT Modify Socket Event Names**: WebSocket listener names (e.g., `join_room`, `receive_message`, `callUser`, `sos_alert`) are heavily hardcoded on both frontend client files and backend handlers. Modifying these without synced migrations will break real-time features.
*   **Do NOT Bypass Privacy Maps**: When requesting patient records, always verify that the request doctor's ID is present and set to `approved: true` in the patient's `privacySettings.profileAccess` map.
*   **Do NOT Hardcode Credentials**: Never write API keys, JWT secrets, or DB strings directly in source code. Always use `process.env` in Node and `os.environ` in Python.
*   **Do NOT Break REST APIs**: Maintain standard return objects. Do not change successful returns into completely nested structures without verifying existing frontend fetch hooks.

---

## 🧪 Testing Expectations

*   **No Code Injection**: Ensure code additions do not trigger linting failures. Proactively check your code using the appropriate project formatter.
*   **Verification Verification**: Propose or run sanity tests for custom routes using cURL or mock scripts.
*   **Seeder Integrity**: Verify that modifications do not corrupt local seeding scripts (`seedHospitals.js`, `seed_and_book.js`).

---

## 📝 Commit Message Standards

We follow clean, standard semantic commit message conventions:
*   `feat: ...` for brand new features or components.
*   `fix: ...` for bug fixes and functional patches.
*   `docs: ...` for documentation creation or updates.
*   `chore: ...` for dependency adjustments, gitignores, and config tweaks.
*   `refactor: ...` for code cleanups without functional side-effects.

---

## 📖 Documentation Maintenance Rules

*   Keep Markdown clean and organized with appropriate header structures.
*   Use Mermaid blocks to visualize complex state machines or flow paths.
*   Do not fabricate features. Only document configurations, models, and dependencies verified to exist in the repository.
