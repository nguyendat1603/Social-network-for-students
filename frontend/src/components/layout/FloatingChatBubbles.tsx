import React from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../config/routes.config';
import { CampusIcon } from '../common/CampusIcon';

// Open the API-backed messenger; never synthesize contacts or replies.
export const FloatingChatBubbles: React.FC = () => <Link className="campus-message-launcher" to={APP_ROUTES.MESSENGER} aria-label="Mở tin nhắn">
  <CampusIcon name="message" /><span>Tin nhắn</span>
</Link>;
