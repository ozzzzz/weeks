# Weeks

A life visualization application that displays your entire life as weeks - each week represented as a single "coin" on the screen.

## Description

This application visualizes weeks for the whole life of a person.

To do it we need 3 main things:
- Date of birth (or at least year)
- Life expectancy based on statistics or user-defined
- Extra life expectancy (e.g. 100 years in total)

## Main Features

- 1 week as a 1 "coin" (point/circle) on the screen
- Always show all weeks for the whole life (up to 100 years) or have the ability to zoom to see specific periods better
- Dates are fixed in the timeline, but weeks are based on the person's date of birth

## Calendar Features

- Set specific dates with visual marks (e.g. birth of a child, wedding day)
- Set periods in different formats (specific date, month/year, or year only) with visual marks (e.g. university studies, work periods)

## Visual Features

- Show weeks (already lived, current, remaining, extra) in different colors with support for different color themes
- Show dates when user hovers over specific week
- Allow user to set their own life expectancy
- 1/3 menu on the left side that can be collapsed/expanded

## AI Features

- Extract structured data from unstructured text input using an LLM agent

## Tech Stack

- Next.js with App Router
- TypeScript
- Mantine components for UI
- Tailwind CSS for layout and custom styles
- Redux Toolkit for state management

## Project Structure

```
src/app/
├── components/   # React components
├── utils/        # Utility functions
├── types/        # TypeScript types
├── store.ts      # Redux store and slices
└── hooks.ts      # Custom hooks
```

## Roadmap

### Basic Features
- [ ] Extract Three.js canvas into a separate component
- [ ] Add possibility to set calendar events and periods

### Persistence
- [ ] Save/load user data in JSON format
- [ ] Save in the cloud with authentication or unique link

### Nice to Have
- [ ] Save expand/collapse state of left menu in local storage
- [ ] Save user settings (life expectancy, extra years, color theme) in local storage
