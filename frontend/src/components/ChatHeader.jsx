import {
  FLOW_IDS,
  FLOW_NAMES,
  getFlowDisplayName,
} from "../utils/flowConstants";

function ChatHeader({ flowId, onFlowSwitch }) {
  return (
    <div className="chat-header">
      <div className="header-content">
        <div className="header-title">
          <h2>Growth With Flow Chatbot</h2>
          <span className="current-flow">• {getFlowDisplayName(flowId)}</span>
        </div>
        <div className="flow-selector">
          <select
            value={flowId}
            onChange={(e) => onFlowSwitch(e.target.value)}
            className="flow-dropdown"
          >
            <option value={FLOW_IDS.PRESENTATION}>
              {FLOW_NAMES[FLOW_IDS.PRESENTATION]}
            </option>
            <option value={FLOW_IDS.ROADMAP}>
              {FLOW_NAMES[FLOW_IDS.ROADMAP]}
            </option>
            <option value={FLOW_IDS.DYNAMIC_CV}>
              {FLOW_NAMES[FLOW_IDS.DYNAMIC_CV]}
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
