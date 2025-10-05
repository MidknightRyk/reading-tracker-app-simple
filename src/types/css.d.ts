// Global CSS imports (like globals.css)
declare module '*.css';

// SCSS imports
declare module '*.scss' {
    const content: { [className: string]: string };
    export default content;
}
