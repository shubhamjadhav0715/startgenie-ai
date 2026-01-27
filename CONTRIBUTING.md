# 🤝 Contributing to StartGenie AI

Thank you for your interest in contributing to StartGenie AI! This document provides guidelines for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

---

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing viewpoints and experiences

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Git
- MongoDB (or MongoDB Atlas account)
- OpenAI API key

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/startgenie-ai.git
   cd startgenie-ai
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/shubhamjadhav0715/startgenie-ai.git
   ```

4. **Setup backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp ../.env.example .env
   # Edit .env with your credentials
   ```

5. **Setup frontend**
   ```bash
   cd frontend
   npm install
   ```

6. **Run development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   uvicorn app.main:app --reload

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

---

## 🔄 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Manual testing
# Test all affected features
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to GitHub and create a Pull Request
- Fill in the PR template
- Link related issues
- Request review

---

## 💻 Coding Standards

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions/classes
- Maximum line length: 100 characters

```python
def generate_blueprint(startup_idea: str) -> BlueprintContent:
    """
    Generate startup blueprint using RAG
    
    Args:
        startup_idea: User's startup idea description
    
    Returns:
        BlueprintContent object with all sections
    """
    # Implementation
    pass
```

### TypeScript/React (Frontend)

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Use meaningful variable names

```typescript
interface BlueprintProps {
  id: string
  onUpdate: (blueprint: Blueprint) => void
}

export function BlueprintViewer({ id, onUpdate }: BlueprintProps) {
  // Implementation
}
```

### General

- Use meaningful variable/function names
- Keep functions small and focused
- Avoid deep nesting (max 3 levels)
- Remove commented-out code
- No console.log in production code

---

## 📝 Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/updates
- `chore`: Build/tooling changes

**Examples:**
```bash
feat(rag): add FAISS vector store integration
fix(auth): resolve JWT token expiration issue
docs(api): update authentication endpoints
refactor(blueprint): simplify generation logic
test(api): add unit tests for auth endpoints
```

---

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, PR will be merged
4. Your contribution will be credited

---

## 🐛 Reporting Bugs

### Before Reporting

- Check existing issues
- Verify it's reproducible
- Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Mockups, examples, etc.
```

---

## 🏗️ Project Structure

```
startgenie-ai/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── models/   # Data models
│   │   ├── rag/      # RAG pipeline
│   │   └── utils/    # Utilities
│   └── tests/        # Backend tests
├── frontend/         # Next.js frontend
│   ├── src/
│   │   ├── app/      # Pages
│   │   ├── components/ # React components
│   │   └── lib/      # Utilities
│   └── tests/        # Frontend tests
└── docs/             # Documentation
```

---

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [LangChain Documentation](https://python.langchain.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

## 🙏 Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Mentioned in project documentation

---

## 📧 Contact

- **Email:** itsmeshubzz07@gmail.com
- **GitHub Issues:** [Create an issue](https://github.com/shubhamjadhav0715/startgenie-ai/issues)

---

**Thank you for contributing to StartGenie AI! 🚀**
