import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/quiz")({
  beforeLoad: () => { throw redirect({ to: "/mock-tests" }); },
  component: () => null,
});
