Here's a detailed technical specification document for implementing the Musasabi Avatar Visual Design System in Markdown format:

```markdown
# Musasabi Avatar Visual Design System Technical Specification

## Objective

Establish the Musasabi Avatar Visual Design System to define the official visual identity, emotion assets, avatar states, and design tokens for the Musasabi desktop avatar. This builds on the foundation laid by AV-001.

## Vision

The avatar embodies the visible personality of Musasabi AI and is not merely a mascot. It must primarily represent a Musasabi and not a Tanuki.

## Character Direction

**Default Avatar Specifications:**
- **Form**: Cute musasabi with a 2.5–3 head-to-body ratio.
- **Features**: 
  - Soft rounded shape
  - Big eyes
  - Slightly sleepy yet friendly expression
  - Large gliding membrane
  - Fluffy tail
  - Small ears
- **Aesthetic**: Business-friendly yet approachable demeanor.

## Required Files

**File Paths and Purposes:**

- `apps/desktop/src/avatar/design/`
  - `avatarDesignTokens.ts`: Design tokens for size, scale, colors, etc.
  - `avatarPalette.ts`: Color palette definitions.
  - `avatarEmotionMap.ts`: Mapping of emotions to visual settings.
  - `avatarPoseMap.ts`: Mapping of poses corresponding to emotions.
  - `avatarTheme.ts`: Theme settings for consistent aesthetics.

- `docs/AVATAR_VISUAL_DESIGN.md`: Documentation on visual design principles and specifications.

## Avatar Design Tokens

Define design tokens encompassing:
- Physical dimensions (size, scale)
- Aesthetic properties (colors, shadows, and border radii)
- Interaction dynamics (motion speed, bubble spacing)
- Emotional and mode color accents

## Emotions

Define visual settings for each emotional state:
- Emotions: `idle`, `happy`, `thinking`, `learning`, `working`, `sleeping`, `celebrating`, `calling`, `error`.
- Each emotion includes:
  - Face configuration
  - Eye and mouth styles
  - Body pose specifics
  - Motion speed settings
  - Bubble tones and accent color tokens

## Modes

Define indicators for various mode states:
- Modes: `Learning`, `Work`, `Sales`, `AutoCall`, `Sleep`, `Error`.
- AutoCall Mode: Must visually emphasize sensitivity/control, avoiding a playful appearance.

## UI Integration

Avatar UI must display:
- Current mode and emotion
- Status indicator
- Speech bubble with relevant text

## Asset Placeholder System

Placeholder SVG assets located at `apps/desktop/assets/avatar/musasabi/`:
- SVG files: `idle.svg`, `happy.svg`, `thinking.svg`, `learning.svg`, `working.svg`, `sleeping.svg`, `celebrating.svg`, `calling.svg`, `error.svg`.
- Temporary placeholders can be used where actual art is absent.

## Important Rule

Exclusion of Tanuki Assets:
- Avoid any references or terms associated with Tanuki.
- Permitted terms include Musasabi, MUSA, Musasabi Avatar.

## Tests

Implement tests for:
- Design token exports
- Completeness of emotion and mode maps
- Asset placeholders existence
- Assurance of no Tanuki references

## Documentation

Update and maintain the following documents:
- `README.md`
- `CHANGELOG.md`
- `docs/AVATAR_ENGINE.md`
- `docs/AVATAR_VISUAL_DESIGN.md`

## Restrictions

Avoid implementation of:
- Live2D, 3D capabilities
- Lip sync, voice interaction
- Physical dynamics (physics)

The focus is strictly on the visual design foundation.

## Acceptance Criteria

- Establishment of Musasabi avatar design system
- Completion of emotion and mode mappings
- Existence of placeholder asset files
- Usage of Musasabi terminology in UI
- Elimination of Tanuki references
- Passing of all implemented tests
- Updated documentation

## Deliverables

Report containing:
- Details of changed files
- Test results summary
- Screenshots (if available)
- Suggested commit: `feat(avatar): add musasabi visual design system`

```

This document outlines all necessary steps and considerations for implementing the Musasabi Avatar Visual Design System based on your provided task instructions.