# AGENTS.md — AgriGuide Project Rules

## 1. Project Identity

Project: AgriGuide — AI Agricultural Extension Agent.

Purpose: Help farmers or agricultural extension workers report maize crop problems, retrieve relevant guidance and previous cases, review source-referenced AI advisories, approve proposed follow-up tasks, save records, and reopen them later.

This is our assigned hackathon project. Do not transform it into an unrelated application.

## 2. Mandatory Free-Tier Policy

All development, AI, hosting, database, and deployment services must comply with the hackathon's free-service requirements.

- Use only genuinely free plans, free tiers, or eligible open-source software.
- Never select a paid plan, paid API, paid AI model, paid credit, sponsored credit, or paid trial.
- Never add a credit card or enable billing, automatic upgrades, or paid usage.
- Before recommending an external service, verify its official pricing, quota, eligibility, and regional availability.
- If a free service is unavailable or unsuitable, explain the limitation and propose another eligible option.
- Do not silently substitute a paid service for a free one.
- Minimize external dependencies and avoid unnecessary services.
- Do not claim a service is free without checking its current official terms.

## 3. Required Technology Stack

- Frontend: React.
- Backend: Python, Django, and Django REST Framework.
- Database: PostgreSQL.
- AI: An eligible free-tier model/API that supports the required agent workflow and is available in our region.
- Version control: GitHub.
- Deployment: Public HTTPS frontend and hosted backend, with a remote PostgreSQL database, using eligible free services.

Do not change this stack without explaining why and obtaining approval.

## 4. Project Workflow

The application must support:

1. Submit a crop report with location, crop, growth stage, symptoms, and available field conditions.
2. Validate the report and ask for essential missing information.
3. Retrieve previous case histories for the selected location.
4. Search stored agricultural guidance.
5. Generate a cautious advisory using retrieved evidence.
6. Display the advisory and source references for review.
7. Allow the user to edit the advisory and proposed follow-up task.
8. Require explicit user confirmation before saving.
9. Save approved records to PostgreSQL through the Django backend.
10. List and reopen saved records.

The first demo focuses on maize and uses clearly labelled fictional demonstration data.

## 5. Agent Tools

The backend agent must have three clearly defined tools:

- `readCaseHistory`: retrieve existing case histories for a selected location.
- `searchCropGuidance`: retrieve relevant guidance notes and source references.
- `saveAdvisoryAndFollowUp`: save validated advisory and follow-up data only after explicit user confirmation.

Use a bounded agent/tool loop. Validate tool inputs and outputs, handle errors, and never claim an unsuccessful operation succeeded.

## 6. Evidence and Agricultural Safety

- Treat retrieved guidance as the source of truth for the advisory.
- Never invent source IDs, official references, or agricultural facts.
- Clearly distinguish observations, possible explanations, and confirmed facts.
- Do not present an AI-generated possibility as a confirmed diagnosis.
- If evidence is insufficient, say so and request clarification or recommend consulting a qualified local agricultural professional.
- Clearly label synthetic data as fictional demonstration data.
- Do not introduce unsupported pesticide, chemical, or treatment prescriptions.

## 7. Security

- Never commit API keys, database credentials, tokens, or passwords.
- Store secrets in environment variables.
- Provide `.env.example` with placeholders only.
- Keep AI API calls and database access on the backend.
- Validate inputs and handle errors safely.
- Do not expose secrets in browser code or frontend build variables.

## 8. Code Change Rules

- Inspect the existing codebase before editing.
- Preserve working code and existing project conventions.
- Avoid unnecessary rewrites and dependencies.
- Do not overwrite important files without inspecting them.
- Keep frontend components, API logic, backend logic, and database models appropriately separated.
- Do not fabricate API responses or silently hide backend failures.
- Use mock data only as an explicitly labelled development fallback.
- Keep the application responsive and accessible.
- Run the available tests, lint checks, and build commands after changes.
- Explain any incomplete work honestly.

## 9. Hackathon Acceptance Criteria

The final application must provide:

- A public HTTPS URL.
- A working end-to-end agent workflow.
- Three functioning agent tools.
- PostgreSQL-backed persistent records.
- Source-referenced advisories.
- Input validation and clarification.
- Explicit confirmation before final data changes.
- Clear error handling and bounded agent execution.
- Five documented test cases.
- Setup instructions, `.env.example`, service register, known limitations, and team contributions.

## 10. Agent Working Procedure

For every task:

1. Read this `AGENTS.md` before making changes.
2. Inspect the relevant existing files.
3. State any important assumptions or incompatibilities.
4. Implement the requested changes directly.
5. Test the changes.
6. Report changed files, test results, and remaining work.

Do not start paid services, change the approved stack, or weaken the free-tier policy.
