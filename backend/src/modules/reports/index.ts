import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authMiddleware } from '@/middleware';

const router = Router();
const reportsController = new ReportsController();

router.use(authMiddleware);

router.get('/sales', (req, res, next) =>
  reportsController.getSalesReport(req, res, next)
);

router.get('/profit', (req, res, next) =>
  reportsController.getProfitReport(req, res, next)
);

router.get('/module-wise', (req, res, next) =>
  reportsController.getModuleWiseReport(req, res, next)
);

router.get('/staff-performance', (req, res, next) =>
  reportsController.getStaffPerformanceReport(req, res, next)
);

router.get('/gst', (req, res, next) =>
  reportsController.getGSTReport(req, res, next)
);

router.get('/dashboard', (req, res, next) =>
  reportsController.getDashboardStats(req, res, next)
);

export default router;
