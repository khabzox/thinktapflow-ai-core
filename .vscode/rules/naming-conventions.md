# 🏷️ Naming Conventions

## **Files & Directories**

- `kebab-case` for file names: `groq-provider.ts`
- `camelCase` for directories: `src/utils/`
- `PascalCase` for types: `AIServiceConfig`

## **Functions**

- `camelCase` with action verbs: `createAIService()`, `analyzeContent()`
- Factory functions: `create` prefix
- Utility functions: descriptive action names

## **Variables**

- `camelCase` for variables: `const apiKey = '...'`
- `UPPER_SNAKE_CASE` for constants: `const MAX_RETRIES = 3`
- `PascalCase` for types/interfaces: `interface AIResponse`

## **Exports**

- Always use named exports
- Group related exports
- Use descriptive names that indicate purpose
