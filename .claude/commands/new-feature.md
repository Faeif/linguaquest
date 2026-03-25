# Command: /new-feature
# Usage: /new-feature [feature-name]

## Action
When the user runs this command, perform the following steps:
1. Create a new markdown file in `docs/features/[feature-name].md`.
2. Generate a standard feature spec template in that file containing:
   - Goal
   - Acceptance Criteria
   - Database Changes (Required schemas/RLS)
   - API Contracts (Endpoints & Zod schemas)
   - UI Components
3. Ask the user if the generated spec looks correct before writing any code.
