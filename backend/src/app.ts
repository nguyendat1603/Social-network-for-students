import express from 'express';
import cors from 'cors';
import { envConfig } from './config/env.config';
import { errorMiddleware } from './common/middlewares/error.middleware';
import { sendSuccess } from './common/utils/response.util';
import { identityRoutes } from './modules/identity/identity.routes';
import { feedRoutes } from './modules/feed/feed.routes';
import { courseReviewRoutes } from './modules/course-review/course-review.routes';
import { resourceHubRoutes } from './modules/resource-hub/resource-hub.routes';

const app = express();

app.use(
  cors({
    origin: envConfig.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/api/v1/health', (_req, res) => {
  sendSuccess(res, {
    service: 'mxh-hssv-backend',
    phase: 'Phase 2 - Identity, Academic Feed, Course Review & Resource Hub',
    database: 'Supabase Online PostgreSQL',
    timestamp: new Date().toISOString(),
  });
});

// Module 1: Identity & Student Verification
app.use('/api/v1/identity', identityRoutes);

// Module 2: Academic Discussion & Feed
app.use('/api/v1/feed', feedRoutes);

// Module 4: Course Review & Peer Q&A
app.use('/api/v1/course-reviews', courseReviewRoutes);

// Module 5: Document & Resource Hub
app.use('/api/v1/resources', resourceHubRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
