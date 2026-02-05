
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { Router } from 'express';
import { AnalyticsController } from './controllers/analytics.controller';

const analyticsRouter = Router();

analyticsRouter.use(ClerkExpressWithAuth());

analyticsRouter.get('/stats', AnalyticsController.getBusinessStats);

export default analyticsRouter;
