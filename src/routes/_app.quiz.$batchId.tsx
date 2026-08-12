import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/quiz/$batchId")({
  beforeLoad: ({ params }) => { throw redirect({ to: "/mock-tests/$id", params: { id: params.batchId } }); },
  component: () => null,
});
