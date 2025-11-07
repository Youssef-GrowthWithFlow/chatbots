export const FLOW_IDS = {
  PRESENTATION: "PRESENTATION",
  ROADMAP: "ROADMAP",
  DYNAMIC_CV: "DYNAMIC_CV",
};

export const FLOW_NAMES = {
  [FLOW_IDS.PRESENTATION]: "General Info",
  [FLOW_IDS.ROADMAP]: "Build a Roadmap",
  [FLOW_IDS.DYNAMIC_CV]: "Dynamic CV",
};

export const getFlowDisplayName = (flowId) => {
  return FLOW_NAMES[flowId] || FLOW_NAMES[FLOW_IDS.PRESENTATION];
};
