import express from 'express';
import { customerOrderController } from '../controllers/customerOrderController';

const router = express.Router();

router.get('/', customerOrderController.getAllOrders);
router.get('/:id', customerOrderController.getOrderById);
router.post('/resync', customerOrderController.resyncOrders);
router.delete('/clear-all', customerOrderController.clearAllOrders);

export default router; 