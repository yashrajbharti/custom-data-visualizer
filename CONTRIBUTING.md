# Contributing to 3D Data Visualizer

Thank you for your interest in contributing to the 3D Data Visualizer project! This document provides guidelines and information to help you get started.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Module Overview](#module-overview)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Development Setup

### Prerequisites

- A modern web browser with WebGL2 support (Chrome, Firefox, Edge, Safari)
- A local web server (Python's `http.server`, Node's `http-server`, or VS Code Live Server)
- Git for version control

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd custom-data-visualizer
   ```

2. **Start a local server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js http-server
   npx http-server -p 8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

### Project Structure

```
custom-data-visualizer/
├── app.js                 # Main application entry point
├── index.html            # Main visualization page
├── uploads.html          # Data upload page
├── uploads.js            # Upload page logic
├── dataWorker.js         # Web Worker for data processing
├── uploadWorker.js       # Web Worker for upload processing
├── module/               # ES6 modules
│   ├── render.mjs       # WebGL2 rendering engine
│   ├── interactions.mjs # User interaction handlers
│   ├── loadData.mjs     # Data loading & compartments
│   ├── shaders.mjs      # WebGL shader definitions
│   ├── history.mjs      # Undo/redo functionality
│   ├── store.mjs        # State persistence
│   └── ...              # Other utility modules
├── styles/              # CSS stylesheets
└── data/                # Sample data and generation scripts
```

## Project Architecture

### Core Principles

1. **Zero Dependencies**: Pure vanilla JavaScript with no external libraries
2. **Modular Design**: ES6 modules for separation of concerns
3. **Performance First**: 60 FPS rendering with efficient data structures
4. **Accessibility**: Keyboard navigation and semantic HTML

### Technology Stack

- **WebGL2**: GPU-accelerated 3D rendering
- **IndexedDB**: Client-side storage for large datasets
- **Web Workers**: Background processing for non-blocking operations
- **LocalStorage**: Persistent state (zoom, rotation)
- **ES6 Modules**: Native JavaScript modules

## Module Overview

### Rendering Pipeline

**render.mjs**
- Manages WebGL2 context and rendering loop
- Compiles and links vertex/fragment shaders
- Applies transformation matrices (rotation, zoom)
- Renders points with focus state highlighting

**shaders.mjs**
- Defines GLSL vertex and fragment shaders
- Controls point size and color based on focus state

**createShader.mjs**
- Utility for compiling WebGL shaders
- Error handling for shader compilation

**resize.mjs**
- Handles canvas resizing on viewport changes
- Maintains proper aspect ratio

### Data Management

**loadData.mjs**
- Loads data from IndexedDB in batches (5000 points initially)
- Manages 64 spatial compartments (8x8 grid)
- Loads visible compartments based on zoom level
- Coordinates with Web Workers for data processing

**compartments.mjs**
- Calculates compartment index from 3D coordinates
- Divides sphere into 8x8 latitude/longitude grid

**sphere.mjs**
- Converts 2D coordinates (x, y) to 3D sphere coordinates
- Uses spherical coordinate math: lat = y * π, lng = x * 2π

**dataWorker.js**
- Processes large datasets in background thread
- Converts coordinates and organizes into compartments
- Prevents UI blocking during data processing

### Interaction System

**interactions.mjs**
- Handles drag-and-drop for point movement
- Implements nesting logic (hold 1200ms to nest)
- Implements bursting logic (double-click to expand)
- Manages interaction state and history

**eventCoordinates.mjs**
- Normalizes mouse and touch event coordinates
- Converts screen space to WebGL clip space

**normalize.mjs**
- Normalizes points to sphere surface
- Ensures points maintain correct 3D positioning

### 3D Transformations

**matrixUtils.mjs**
- Matrix multiplication for transformations
- Matrix inversion for coordinate conversion
- Point-matrix operations

**rotateMatrix.mjs**
- Generates 4x4 rotation matrices
- Combines X and Y axis rotations

**centerCoordinates.mjs**
- Converts screen center to world coordinates
- Used for determining visible compartments

### State Management

**store.mjs**
- Persists zoom and rotation in LocalStorage
- Provides getters/setters for state values

**history.mjs**
- Implements undo/redo using command pattern
- Manages history and redo stacks
- Deep clones point arrays for immutability

**buttonState.mjs**
- Enables/disables UI buttons based on state
- Updates button classes and ARIA attributes

**info.mjs**
- Updates status messages for screen readers
- Provides user feedback for actions

## Development Workflow

### Adding New Features

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the modular architecture
   - Keep modules focused on single responsibility
   - Add JSDoc comments for public functions

3. **Test thoroughly**
   - Test in multiple browsers
   - Test with different dataset sizes
   - Verify accessibility features work

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Format

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Build process or tooling changes

## Code Style Guidelines

### JavaScript

- Use ES6+ features (const, let, arrow functions, destructuring)
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for exported functions
- Avoid global variables

### Example Function Documentation

```javascript
/**
 * Converts 2D coordinates to 3D sphere coordinates.
 * 
 * @param {number} x - X coordinate in range [-1, 1]
 * @param {number} y - Y coordinate in range [-1, 1]
 * @returns {Array<number>} 3D coordinates [x, y, z]
 * 
 * @example
 * const coords = convertToSphereCoords(0.5, 0.5);
 * // Returns [0.707, 0.707, 0.707]
 */
export const convertToSphereCoords = (x, y) => {
  // Implementation
};
```

### HTML/CSS

- Use semantic HTML elements
- Include ARIA attributes for accessibility
- Use CSS custom properties for theming
- Mobile-first responsive design

## Testing

### Manual Testing Checklist

- [ ] Test drag and drop on desktop
- [ ] Test touch interactions on mobile
- [ ] Test keyboard navigation (Tab, Arrow keys)
- [ ] Test nesting (hold for 1200ms)
- [ ] Test bursting (double-click)
- [ ] Test undo/redo (Ctrl+Z, Ctrl+Shift+Z)
- [ ] Test rotation (Shift + drag / arrow keys)
- [ ] Test zoom controls
- [ ] Test with large datasets (100K+ points)
- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Test screen reader compatibility
- [ ] Verify 60 FPS performance

### Performance Testing

Check Chrome DevTools:
- **Performance**: Should maintain 60 FPS
- **Memory**: No memory leaks during interactions
- **Lighthouse**: Performance score 88+ desktop, 100 mobile

## Submitting Changes

### Pull Request Process

1. **Update documentation** if needed
2. **Test your changes** thoroughly
3. **Create a pull request** with:
   - Clear description of changes
   - Screenshots/GIFs for visual changes
   - Performance impact (if applicable)
   - Testing done

4. **Address review feedback** promptly

### PR Title Format

```
type: brief description

Examples:
feat: add color customization for data points
fix: resolve touch rotation on Safari
docs: update module architecture diagram
perf: optimize compartment loading for 200K points
```

## Key Concepts to Understand

### Compartmentalized Loading

The sphere is divided into 64 compartments (8x8 grid) based on latitude and longitude. This allows loading only visible points at high zoom levels:

- Zoom < 2.5: Show all initial 5000 points
- Zoom >= 3.0: Load additional points from nearest compartment

### Nesting Data Structure

Points can be nested infinitely using a children array:

```javascript
const point = [x, y, z];  // 3D coordinates
point.children = [        // Nested points
  [x2, y2, z2],
  [x3, y3, z3]
];
```

### Coordinate Systems

1. **2D Input**: x, y in range [-1, 1]
2. **3D Sphere**: Converted using spherical coordinates
3. **Screen Space**: Mouse/touch coordinates
4. **Clip Space**: WebGL normalized device coordinates

## Questions or Need Help?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be respectful and constructive in discussions

Thank you for contributing!
