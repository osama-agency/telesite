import express from 'express';
import { purchaseController } from '../controllers/purchaseController';

const router = express.Router();

router.get('/', purchaseController.getAllPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/', purchaseController.createPurchase);
router.post('/:id/receive', purchaseController.receivePurchase);
router.put('/:id', purchaseController.updatePurchase);
router.delete('/:id', purchaseController.deletePurchase);

export default router; 