import express from 'express';
import { productController } from '../controllers/productController';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.post('/', productController.create);
router.post('/sync', productController.sync);
router.patch('/:id', productController.update);
router.patch('/bulk', productController.bulkUpdate);
router.post('/:id/receive', productController.receiveDelivery);

export default router; 