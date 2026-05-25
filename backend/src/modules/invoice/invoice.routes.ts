import { Router } from 'express';
import { InvoiceController } from './invoice.controller';
import { authMiddleware, validateRequest, uploadDocumentMiddleware, readOnlyMiddleware } from '@/middleware';
import {
  createInvoiceSchema,
  finalizeInvoiceSchema,
} from '@/shared/dtos';

const router = Router();
const invoiceController = new InvoiceController();

// All invoice routes require authentication
router.use(authMiddleware);
router.use(readOnlyMiddleware); // Apply RBAC - block write operations for demo users

router.post(
  '/',
  validateRequest(createInvoiceSchema, 'body'),
  (req, res, next) => invoiceController.createInvoice(req, res, next)
);

router.get('/', (req, res, next) =>
  invoiceController.getAllInvoices(req, res, next)
);

router.get('/stats', (req, res, next) =>
  invoiceController.getInvoiceStats(req, res, next)
);

router.get('/:id', (req, res, next) =>
  invoiceController.getInvoice(req, res, next)
);

router.post(
  '/:id/items',
  (req, res, next) => {
    // Validate line item data
    const { moduleType, referenceId, description } = req.body;
    if (!moduleType || !referenceId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'moduleType and referenceId are required',
          code: 'VALIDATION_ERROR',
        },
      });
    }
    (req as any).validated = { moduleType, referenceId, description };
    invoiceController.addLineItem(req, res, next);
  }
);

router.delete('/:id/items/:itemId', (req, res, next) =>
  invoiceController.removeLineItem(req, res, next)
);

router.post('/:id/finalize', (req, res, next) =>
  invoiceController.finalizeInvoice(req, res, next)
);

router.delete('/:id', (req, res, next) =>
  invoiceController.deleteInvoice(req, res, next)
);

// Upload document for an invoice
router.post('/:id/upload', uploadDocumentMiddleware, (req, res, next) =>
  invoiceController.uploadInvoiceDocument(req, res, next)
);

export default router;
