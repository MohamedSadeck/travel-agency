import { reactRouter } from "@react-router/dev/vite";
import { sentryReactRouter, type SentryReactRouterBuildOptions } from "@sentry/react-router";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const sentryConfig: SentryReactRouterBuildOptions = {
  org: "mohameds-company",
  project: "travel-agency",
  // An auth token is required for uploading source maps;
  // store it in an environment variable to keep it secure.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // ...
};

export default defineConfig(config => {return{
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(),sentryReactRouter(sentryConfig, config)],
  build: {
    // Enable source maps for debugging
    sourcemap: true,
    // Allow Vite to transform mixed CommonJS/ESM modules (Syncfusion ships CommonJS)
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/, /@syncfusion/]
    }
  },
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
  ssr: {
    // Treat Syncfusion packages as non-external when doing SSR to ensure they are processed
    noExternal: [/^@syncfusion\//]
  }
}});
