# Subscription Form – UI Modernization

## Overview
Modernized the existing stacked-card subscription form into a dual-view interface with a **Classic View** and a **Modern View** (tabbed layout) using MUI Tabs.

## Approach
- Added a toggle switch at the top to switch between Classic and Modern views (defaults to Classic).
- In Modern View, the 5 form sections (Personal Details, Meal Plan Details, Subscription Details, Payment Details, Instructions) are rendered as navigable tabs.
- Tabs show error indicators (red dot) for sections with validation issues.
- On submit, the form auto-navigates to the first tab with errors.
- "Next" and "Previous" buttons allow sequential tab navigation.
- All existing validation, `useEffect` hooks, and calculated fields remain intact.

## Setup
```bash
npm install
npm start
```

## Tech Stack
- React 18
- MUI 5
- React Hook Form
