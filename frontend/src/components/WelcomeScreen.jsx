import { FLOW_IDS, FLOW_NAMES } from "../utils/flowConstants";

function WelcomeScreen({ onFlowSelection }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-message">
        <h3>Hi! I'm GrowthBot. How can I help you?</h3>
        <p>Choose a flow to get started, or just type your question below:</p>
      </div>
      <div className="flow-buttons">
        <button
          className="flow-button"
          onClick={() =>
            onFlowSelection(
              FLOW_IDS.PRESENTATION,
              FLOW_NAMES[FLOW_IDS.PRESENTATION],
            )
          }
        >
          {FLOW_NAMES[FLOW_IDS.PRESENTATION]}
        </button>
        <button
          className="flow-button"
          onClick={() =>
            onFlowSelection(FLOW_IDS.ROADMAP, FLOW_NAMES[FLOW_IDS.ROADMAP])
          }
        >
          {FLOW_NAMES[FLOW_IDS.ROADMAP]}
        </button>
        <button
          className="flow-button"
          onClick={() =>
            onFlowSelection(
              FLOW_IDS.DYNAMIC_CV,
              FLOW_NAMES[FLOW_IDS.DYNAMIC_CV],
            )
          }
        >
          {FLOW_NAMES[FLOW_IDS.DYNAMIC_CV]}
        </button>
      </div>
    </div>
  );
}

export default WelcomeScreen;
