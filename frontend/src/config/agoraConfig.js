import { API_BASE_URL } from './api';

export const agoraConfig = {
  appId: '03cd93ab8307409c9838aaae3bf2bfcf',
  // Channel name will be dynamically generated based on appointment ID
  tokenServerUrl: `${API_BASE_URL}/api/agora/token` // We'll implement this endpoint later
};
