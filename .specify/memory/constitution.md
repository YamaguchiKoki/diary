<!--
Sync Impact Report:
Version change: [INITIAL] → 1.0.0
Modified principles: N/A (initial version)
Added sections: All sections (initial constitution)
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - reviewed, aligned with Module-Based Architecture principle
  ✅ spec-template.md - reviewed, aligned with Type Safety principle
  ✅ tasks-template.md - reviewed, aligned with testing and implementation principles
  ⚠ Command files in .claude/commands/ - flagged for review to ensure generic guidance
Follow-up TODOs: None
-->

# Diary Project Constitution

## Core Principles

### I. Module-Based Architecture (NON-NEGOTIABLE)

The codebase MUST follow a feature-based module structure where:

- **modules/** contains domain-specific functionality organized by feature (notion/, posts/, home/)
- Each module MUST have clear subdirectories: service/ (business logic), types/ (type definitions), ui/ (components)
- **components/** contains ONLY domain-agnostic, reusable UI components
- **app/** contains ONLY Next.js page definitions with minimal logic
- Business logic MUST NOT be placed in app/ directory; it belongs in modules/

**Rationale**: This architecture ensures clear separation of concerns, makes features independently testable, and prevents the app directory from becoming a dumping ground for business logic.

### II. Type Safety First

All code MUST be fully type-safe with TypeScript strict mode:

- No `any` types unless absolutely necessary and explicitly justified
- All API responses MUST be parsed through zod schemas or type guards
- Environment variables MUST be validated at runtime using @t3-oss/env-nextjs and zod
- Route definitions MUST use the type-safe routes.ts helper functions, never hardcoded strings
- All Notion API responses MUST be transformed through parser functions with explicit types

**Rationale**: Type safety prevents runtime errors, improves developer experience with autocomplete, and serves as living documentation. The Notion API is untyped, so explicit parsing is critical.

### III. Caching Strategy

All external API calls MUST implement appropriate caching:

- Individual post fetches MUST use "use cache" directive with daily expiration
- List queries (by year, all posts) MUST use appropriate cache tags for granular invalidation
- Cache keys MUST follow the pattern: `posts-${identifier}` for consistent invalidation
- Minimize Notion API calls through intelligent caching
- Document cache expiration strategy in code comments

**Rationale**: The Notion API has rate limits and latency. Proper caching ensures fast page loads and reduces API costs while maintaining data freshness.

### IV. Biome Tooling Compliance

All code formatting and linting MUST use Biome (NOT ESLint or Prettier):

- Run `npm run format` before commits (enforced by Lefthook pre-commit hook)
- Run `npm run lint` to check for violations
- The `src/components/ui` directory is exempt from Biome linting (third-party components)
- When editing ui/ components, preserve existing style and be cautious
- All new code MUST pass Biome checks before merging

**Rationale**: Biome is faster than ESLint+Prettier and provides consistent formatting. The exception for ui/ prevents churn on vendored components.

### V. Japanese-First Content

All user-facing content MUST support Japanese language:

- Font configuration MUST include Japanese-optimized fonts (Noto Sans JP)
- Text layout MUST handle vertical and horizontal Japanese text properly
- Comments in code MAY be in Japanese to align with content domain
- Error messages and UI text MUST be in Japanese (or localized appropriately)

**Rationale**: This is a Japanese content site. Proper Japanese typography and language support is not optional—it's a core requirement for user experience.

### VI. Notion Block Extensibility

When adding support for new Notion block types:

- Parser logic MUST be added to `modules/notion/service/parser.ts`
- Rendering logic MUST be added to `modules/notion/ui/view/BlockRenderer.tsx`
- Both files MUST be updated together to maintain consistency
- New block types MUST include TypeScript types in `modules/notion/types/`
- Document supported block types in code comments

**Rationale**: Notion's block-based content model requires parallel updates to parsing and rendering. Incomplete implementations lead to broken content display.

### VII. Git Hooks Enforcement

Quality gates MUST be enforced through Lefthook git hooks:

**Pre-commit:**
- Biome auto-format on staged files
- TypeScript type checking (tsc --noEmit)

**Pre-push:**
- Full Biome lint check
- Full TypeScript type checking

Commits MUST NOT bypass hooks unless explicitly justified.

**Rationale**: Automated quality checks prevent broken code from entering the repository and maintain consistent code quality across all contributors.

## Development Workflow

### Code Review Standards

All changes MUST:
- Pass all git hooks (pre-commit and pre-push checks)
- Include type annotations for all new functions and components
- Use the routes.ts helper for all navigation/linking
- Follow the established module structure (no business logic in app/)
- Update relevant parser.ts and BlockRenderer.tsx if Notion blocks are affected

### Testing Requirements

While comprehensive test coverage is aspirational, these testing principles apply:

- Notion data transformations SHOULD have unit tests for parser functions
- New block type support SHOULD include manual testing with real Notion content
- Cache invalidation logic SHOULD be manually verified
- Route changes MUST be tested to ensure type safety is preserved

### Performance Standards

- Initial page load MUST be under 2 seconds on standard network conditions
- Notion API calls MUST be cached appropriately (see Principle III)
- Images from Notion MUST use Next.js Image component with proper optimization
- Unused code MUST be detected and removed using `npm run knip`

## Technology Constraints

### Required Stack

- **Framework**: Next.js 16+ with App Router (NOT Pages Router)
- **React**: Version 19+ (using new JSX transform)
- **TypeScript**: Version 5+ with strict mode enabled
- **Linting/Formatting**: Biome (NOT ESLint or Prettier)
- **Environment Validation**: @t3-oss/env-nextjs with zod schemas
- **Git Hooks**: Lefthook (NOT Husky)

### Prohibited Patterns

- Hardcoded route strings (MUST use routes.ts)
- Business logic in app/ directory (MUST use modules/)
- Unvalidated environment variables (MUST use env.ts)
- ESLint or Prettier configuration (MUST use Biome)
- `any` types without explicit justification
- Notion API calls without caching strategy

## Governance

### Amendment Process

This constitution MAY be amended when:

1. A new architectural pattern is needed that conflicts with current principles
2. Technology stack changes require principle updates (e.g., framework upgrade)
3. New Notion integration patterns emerge that need formalization
4. Community best practices evolve (e.g., new Next.js caching patterns)

Amendments MUST:
- Be documented with clear rationale
- Update dependent templates (plan-template.md, spec-template.md, tasks-template.md)
- Increment version number according to semantic versioning
- Be reviewed for consistency with CLAUDE.md project guidance

### Versioning Policy

- **MAJOR** (X.0.0): Removal of principles, breaking architectural changes
- **MINOR** (0.X.0): Addition of new principles, expanded sections
- **PATCH** (0.0.X): Clarifications, typo fixes, non-semantic improvements

### Compliance Review

All pull requests MUST verify:
- Adherence to Module-Based Architecture (Principle I)
- TypeScript strict mode compliance (Principle II)
- Biome passing without warnings (Principle IV)
- Appropriate caching for external calls (Principle III)
- Git hooks passing on all commits (Principle VII)

### Complexity Justification

Any deviation from these principles MUST include:
- Clear explanation of why the principle cannot be followed
- Exploration of alternatives that would comply
- Documented trade-offs and technical debt implications
- Plan for eventual remediation if applicable

### Runtime Guidance

Developers SHOULD reference CLAUDE.md for:
- Current project structure and conventions
- Command reference (npm scripts)
- Architecture decision rationale
- Notion integration patterns and examples

**Version**: 1.0.0 | **Ratified**: 2026-01-23 | **Last Amended**: 2026-01-23
