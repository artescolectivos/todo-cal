# Project

# Tessl & Spec Driven Development <!-- tessl-managed -->

This project uses the [Tessl spec driven development framework](.tessl/framework/agents.md) and toolkit for software development: @.tessl/framework/agents.md

# Knowledge Index <!-- tessl-managed -->

Documentation for dependencies and processes can be found in the [Knowledge Index](./KNOWLEDGE.md)

# Plan Files <!-- tessl-managed -->

ALWAYS create [plan files](.tessl/framework/plan-files.md) when planning: @.tessl/framework/plan-files.md

# Project Configuration

## Stack
- **Frontend**: React 19.1.0 with JSX
- **Build Tool**: Vite 6.x
- **Package Manager**: npm
- **Module System**: ES modules

## Testing
- **Framework**: Vitest
- **Testing Library**: @testing-library/react
- **Environment**: jsdom
- **Test Command**: `npm run test` (for CI/automated testing)
- **Watch Mode**: `npm run test:watch` (for development)

## Project Structure
- **Specs**: `./specs/` - Tessl specification files
- **Source**: `./src/` - React application source code
- **Tests**: `./src/` - Test files co-located with source code

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## Dependencies
Key dependencies used in this project:
- `react` & `react-dom` - Core React framework
- `date-fns` - Date manipulation utilities
- `uuid` - Unique identifier generation