import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/quiz/$batchId/result")({
  beforeLoad: () => { throw redirect({ to: "/mock-tests" }); },
  component: () => null,
});
