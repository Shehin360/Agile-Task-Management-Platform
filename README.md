# Agile Kanban Board 📋

A modern, interactive Kanban board application built with **Angular 21** that helps you manage tasks across different workflow stages.

![Angular](https://img.shields.io/badge/Angular-21.1.2-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Key Features

- **🎨 Modern Glassmorphism UI** - Translucent cards, floating orbs, and glowing accents
- **🔄 Drag & Drop Between Columns** - Intuitive interface for moving tasks across workflow stages
- **📊 Drag to Reorder Within Columns** - Prioritize tasks by dragging them up or down in the same column
- **📅 Due Dates** - Set optional deadlines with color-coded badges (overdue, today, upcoming)
- **🎯 Priority Levels** - Low, Medium, High priority badges with color coding
- **📝 Rich Task Details** - Title, description, priority, and due date for each task
- **✏️ Edit & Delete** - Update or remove tasks with modal popups
- **💾 LocalStorage Persistence** - Tasks automatically saved and restored
- **⚡ Reactive Performance** - Powered by Angular Signals and computed properties
- **📱 Fully Responsive** - Optimized for mobile, tablet, and desktop screens
- **🎭 Smooth Animations** - Entry/exit animations and micro-interactions

## 🎯 Workflow Stages

1. **To Do** - Tasks waiting to be started
2. **In Progress** - Tasks currently being worked on
3. **Done** - Completed tasks

## 🛠️ Tech Stack

- **Framework**: Angular 21.1.2
- **Language**: TypeScript 5.7.2
- **Build Tool**: Angular CLI with Vite
- **Styling**: CSS3 with Flexbox
- **Animations**: @angular/animations
- **SSR**: Angular Universal

## 📦 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18.19 or higher recommended)
- **npm** (v10.x or higher)

Check your versions:

```bash
node --version
npm --version
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd agile_project
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Angular core, animations, and development tools.

### 3. Run the Development Server

```bash
npm start
```

Or using Angular CLI directly:

```bash
ng serve
```

The application will open automatically at `http://localhost:4200/`. The app will automatically reload when you modify source files.

### 4. Build for Production

```bash
ng build
```

Production files will be generated in the `dist/` directory. The production build is optimized for performance and speed.

### 5. Run with Server-Side Rendering (SSR)

Build and serve the SSR version:

```bash
npm run build
npm run serve:ssr:agile_project
```

## 📁 Project Structure

```
agile_project/
├── src/
│   ├── app/
│   │   ├── kanban/              # Kanban board component
│   │   │   ├── kanban.ts        # Component logic
│   │   │   ├── kanban.html      # Template
│   │   │   └── kanban.css       # Styles
│   │   ├── app.ts               # Root component
│   │   ├── app.routes.ts        # Application routes
│   │   └── app.config.ts        # App configuration
│   ├── index.html               # Main HTML file
│   ├── main.ts                  # Application entry point
│   └── styles.css               # Global styles
├── public/                      # Static assets
├── angular.json                 # Angular configuration
├── package.json                 # Dependencies
└── tsconfig.json               # TypeScript configuration
```

## 🎮 How to Use

1. **View Tasks**: Tasks are organized in three columns (To Do, In Progress, Done)
2. **Move Tasks**: Click on any task to move it to the next stage:
   - Tasks in "To Do" → move to "In Progress"
   - Tasks in "In Progress" → move to "Done"
   - Tasks in "Done" → stay in Done
3. **Watch Animations**: Tasks smoothly animate when moving between columns

## 🔧 Available Scripts

| Command                           | Description                 |
| --------------------------------- | --------------------------- |
| `npm start`                       | Start development server    |
| `npm run build`                   | Build for production        |
| `npm run watch`                   | Build and watch for changes |
| `npm test`                        | Run unit tests with Vitest  |
| `npm run serve:ssr:agile_project` | Serve SSR build             |

## 🎨 Customization

### Adding New Tasks

Edit `src/app/kanban/kanban.ts`:

```typescript
tasks = [
  { id: 1, title: 'Your Task Title', status: 'todo' },
  // Add more tasks here
];
```

### Changing Colors

Edit `src/app/kanban/kanban.css`:

```css
.column {
  background: #f4f4f4; /* Change column background */
}

.task {
  background: white; /* Change task background */
}
```

### Modifying Animations

Edit the animation timings in `src/app/kanban/kanban.ts`:

```typescript
animate('200ms ease-out', ...) // Adjust duration and easing
```

## 🐛 Troubleshooting

### Port Already in Use

If port 4200 is already in use:

```bash
ng serve --port 4300
```

### Module Not Found Errors

Clear cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

Clear Angular cache:

```bash
rm -rf .angular/cache
ng serve
```

## 📝 Angular CLI Information

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.2.

### Code Scaffolding

To generate a new component:

```bash
ng generate component component-name
```

For a complete list of available schematics (components, directives, pipes):

```bash
ng generate --help
```

### Running Unit Tests

To execute unit tests with [Vitest](https://vitest.dev/):

```bash
ng test
```

### Running End-to-End Tests

For end-to-end (e2e) testing:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Shehin**

## 🙏 Acknowledgments

- Built with [Angular](https://angular.dev/)
- Icons and design inspiration from modern UI/UX principles
- Animation patterns from Angular documentation

## 📚 Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

---

**Note**: This is a learning project created as part of the Springboard Internship program.
