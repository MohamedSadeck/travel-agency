import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  optimizeDeps: {
    // Pre-bundle the Syncfusion packages (CommonJS) to avoid named-export issues
    include: [
      '@syncfusion/ej2-react-navigations',
      '@syncfusion/ej2-base',
      '@syncfusion/ej2-react-buttons',
      '@syncfusion/ej2-react-dropdowns',
      '@syncfusion/ej2-react-grids',
      '@syncfusion/ej2-react-maps',
      '@syncfusion/ej2-react-charts',
      '@syncfusion/ej2-react-splitbuttons'
    ]
  },
  build: {
    // Allow Vite to transform mixed CommonJS/ESM modules (Syncfusion ships CommonJS)
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/, /@syncfusion/]
    }
  },
  ssr: {
    // Treat Syncfusion packages as non-external when doing SSR to ensure they are processed
    noExternal: [/^@syncfusion\//]
  }
});
