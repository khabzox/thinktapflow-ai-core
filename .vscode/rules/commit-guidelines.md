# 📝 Commit Message Guidelines

## **Format**

```
<type>(<scope>): <subject>

<body>

<footer>
```

## **Types**

- `feat`: New feature for users
- `fix`: Bug fix for users
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code change that neither fixes bug nor adds feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependencies
- `ci`: CI configuration changes
- `chore`: Maintenance tasks

## **Examples**

```
feat(providers): add anthropic claude support

Add new provider for Anthropic's Claude API with streaming support
and rate limiting. Includes comprehensive error handling and
health checks.

Closes #123
```

```
fix(cache): resolve memory leak in LRU cache

The cache was not properly cleaning up expired entries, causing
memory usage to grow over time. Added automatic cleanup with
configurable intervals.

Fixes #456
```
