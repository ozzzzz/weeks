This application should visualize weeks for the whole life of a person.

Do do it we need 3 main things:
- date of birth (or at least year)
- life expectancy based on some statistics or user defined
- extra life expectancy (e.g. 100 years in total)

Main features:
- 1 week as a 1 "coin" (point / circle) on the screen
- always show all the weeks for the whole life (up to 100 years)
- dates are fixed in the timeline, but the weeks are based on the person's date of birth and can differ for different people born on different dates

Calendar features:
- allow to set some specific date and make it with the visual mark (e.g. birth of a child, wedding day, etc)
- allow to set some period in different formats (e.g. specific date, or month/year, or year only) and make it with the visual mark (e.g. university studies, work periods, )

Visual features:
- show the weeks (already lived, current, remaining, extra) in different colors and allow to use different color themes
- show dates when user hovers over specific week
- allow user to set their own life expectancy
- have 1/3 menu of the left side that could be collapsed/expanded

AI features:
- extract stuctured data from unstructured text input using an LLM agent

Code features:
- use next.js with the app router
- use typescript
- use basic mantine components for the UI, do not overcomplicate the UI
- use tailwindcss mostly for the layout and custom styles
- use following folder structure:
    - src/app/components for the components
    - src/app/utils for the utility functions
    - src/app/types for the types
- use application state with redux toolkit:
    - store in src/app/store.ts (slices too)
    - hooks in src/app/hooks.ts
- use utils functions in src/app/utils as possible, do not recreate the same logic in different places