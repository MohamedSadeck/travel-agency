import * as Sentry from "@sentry/react-router";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
Sentry.init({
  dsn: "https://5af6ddac372caa98a516b2fd202c0383@o4510181707153408.ingest.de.sentry.io/4510181710692432",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  // Enable logs to be sent to Sentry
  enableLogs: true,
  integrations: [nodeProfilingIntegration(), Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  profilesSampleRate: 1.0, // profile every transaction
});