---
description: Structured sequence to prepare and finalize Pull Request documentation, including summaries, feature lists, and clickable file changes.
---

# PR Workflow

**Description**: Structured sequence to prepare and finalize Pull Request documentation, including summaries, feature lists, and clickable file changes.

## Steps

1. **Pre-flight Check**: Run `/format-and-lint` and then `/done-criteria` to ensure the work is ready for production.
2. **Draft PR Metadata**:
   - **Title**: Use the technical one-line commit style.
   - **Summary**: Write a high-level overview (1-2 sentences) of the goal.
   - **Features**: List new capabilities in a bulleted list.
   - **Changes**: Provide a technical breakdown with clickable links to modified files.
3. **Configuration**: If the change requires new environment variables or Sanity setup, include a `### Configuration` block with the necessary code snippets.
4. **Final Review**: Ensure the PR markdown is clean, technical, and ready for copy-pasting by the user.
5. **Finalize**: Prompt the user to run `/commit-convention` to stage and commit the work before closing the PR.
