# Contributing

Thanks for your interest in contributing to Invoice Generator. This guide covers the workflow and conventions used in this project.

## Getting Started

1. Fork the repository and clone your fork.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to verify everything works.

## Branch and PR Workflow

1. Create a feature branch off `main`:

   ```bash
   git checkout -b feat/your-feature main
   ```

2. Make your changes in small, focused commits.
3. Push your branch and open a pull request against `main`.
4. Describe what your PR does and why. Link any related issues.
5. Wait for review -- maintainers may request changes before merging.

### Branch naming

Use a prefix that describes the type of change:

- `feat/` -- new features
- `fix/` -- bug fixes
- `docs/` -- documentation changes
- `refactor/` -- code restructuring without behavior changes
- `chore/` -- tooling, dependencies, and other maintenance

## Code Style

- **TypeScript** -- all source code is written in TypeScript. Avoid `any` where possible.
- **ESLint** -- run `npm run lint` before submitting. The project uses `eslint-config-next`.
- **Tailwind CSS** -- use utility classes for styling. Avoid inline `style` attributes.
- **Components** -- follow the existing pattern of placing shared components in `src/components/` and feature-specific components in `src/components/<feature>/`.
- **Types** -- keep shared types in `src/lib/` (e.g., `invoice-types.ts`).

## Pull Request Guidelines

- Keep PRs small and focused on a single change.
- Include a clear title and description.
- Make sure `npm run build` and `npm run lint` pass before requesting review.
- If your change affects the UI, include a screenshot or brief description of the visual result.
- Do not introduce new dependencies without discussing them in an issue first.

## Reporting Issues

Open an issue on GitHub with a clear description of the problem, steps to reproduce, and expected behavior. Include browser and OS details if relevant.
