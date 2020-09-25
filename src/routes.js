import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanAvatarController from './app/controllers/DeliverymanAvatarController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', (req, res) => {
  return res.json({ message: 'Server is connected!' });
});

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

/**
 * Entregadores (Deliverymen)
 */
routes.get('/deliverymen', DeliverymanController.index);
routes.post('/deliverymen', DeliverymanController.store);
routes.delete('/deliverymen/:id', DeliverymanController.delete);
routes.put('/deliverymen/:id', DeliverymanController.update);

/**
 * Avatar de Entregadores
 */
routes.post(
  '/deliverymen/avatar',
  upload.single('file'),
  DeliverymanAvatarController.store
);

/**
 * Encomendas (Deliveries)
 */
routes.get('/deliveries', DeliveryController.index);
routes.post('/deliveries', DeliveryController.store);
routes.delete('/deliveries/:id', DeliveryController.delete);
// routes.put('/deliveries/:id', DeliveryController.update);

export default routes;
