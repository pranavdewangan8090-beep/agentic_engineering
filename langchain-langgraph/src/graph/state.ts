import { Annotation } from "@langchain/langgraph";

export const InvestigationState = Annotation.Root({
  userRequest: Annotation<string>,
  findings: Annotation<string[]>({ default: () => [], reducer: (a, b) => a.concat(b) }),
  testResults: Annotation<string[]>({ default: () => [], reducer: (a, b) => a.concat(b) }),
  rootCause: Annotation<string>,
  confidence: Annotation<number>,
  proposedPatch: Annotation<string>,
  approved: Annotation<boolean>,
  iterations: Annotation<number>({ default: () => 0, reducer: (_, b) => b })
});

export type InvestigationStateType = typeof InvestigationState.State;
