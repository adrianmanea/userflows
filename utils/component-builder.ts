
export function buildComponentHtml(code: string): string {
  // Basic cleanup of the code to make it runnable in a browser module
  // 1. Remove import statements (we provide dependencies via global/CDN)
  // 2. Remove export default
  const cleanedCode = code
    .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
    .replace(/export\s+default\s+/g, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@18.2.0?dev",
          "react-dom/client": "https://esm.sh/react-dom@18.2.0/client?dev",
          "lucide-react": "https://esm.sh/lucide-react@0.263.1?dev",
          "framer-motion": "https://esm.sh/framer-motion@10.12.16?dev"
        }
      }
    </script>
    <style>
        /* Ensure dark theme background matches 21st.dev */
        body { background-color: #09090b; color: #f4f4f5; }
    </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen flex items-center justify-center p-4">
    <div id="root" class="w-full h-full"></div>
    <script type="module">
        import React from 'react';
        import { createRoot } from 'react-dom/client';
        import * as LucideIcons from 'lucide-react';
        import * as FramerMotion from 'framer-motion';

        // Error Boundary to catch render errors
        class ErrorBoundary extends React.Component {
            constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
            }
            static getDerivedStateFromError(error) {
                return { hasError: true, error };
            }
            render() {
                if (this.state.hasError) {
                    return React.createElement('div', { className: 'p-4 text-red-500 bg-red-950/20 border border-red-900 rounded' },
                        React.createElement('h3', { className: 'font-bold' }, 'Preview Error'),
                        React.createElement('pre', { className: 'text-xs mt-2 overflow-auto' }, this.state.error.message)
                    );
                }
                return this.props.children;
            }
        }

        try {
            // Inject dependencies into scope for the evaluated code
            const scope = { React, ...LucideIcons, ...FramerMotion };
            const scopeKeys = Object.keys(scope);
            const scopeValues = Object.values(scope);

            // Dynamically evaluate the user's component code
            // We assume the code defines a function/const that is consistent with a React component
            // We strip 'export default' so it becomes a local variable declaration.
            // We attempt to find that variable by name or return the last defined function.
            
            const userCode = \`${cleanedCode}\`;
            
            // Execute code
            // We append a return statement to try and fish out the component
            const runCode = new Function(...scopeKeys, userCode + "; return (typeof Component !== 'undefined' ? Component : ((typeof App !== 'undefined') ? App : null));");
            
            const UserComponent = runCode(...scopeValues);

            if (UserComponent) {
                const root = createRoot(document.getElementById('root'));
                root.render(
                    React.createElement(ErrorBoundary, null, 
                        React.createElement(UserComponent)
                    )
                );
            } else {
               throw new Error("Could not find a component named 'Component' or 'App'. Please ensure your component is named one of these.");
            }

        } catch (err) {
            console.error(err);
             const root = createRoot(document.getElementById('root'));
             root.render(
                React.createElement('div', { className: 'p-4 text-red-500' }, 
                    'Build Error: ' + err.message
                )
            );
        }
    </script>
</body>
</html>`;
}
