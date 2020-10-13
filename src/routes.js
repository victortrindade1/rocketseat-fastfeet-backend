import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanAvatarController from './app/controllers/DeliverymanAvatarController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import StatusDeliveryController from './app/controllers/StatusDeliveryController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', (req, res) => {
  return res.json({ message: 'Server is connected!' });
});

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

/**
 * Relatar problemas com encomendas abertas
 */
routes.get(
  '/delivery/all/problems',
  authMiddleware,
  DeliveryProblemController.index
);
routes.post('/delivery/:delivery_id/problems', DeliveryProblemController.store);
routes.get('/delivery/:delivery_id/problems', DeliveryProblemController.show);

/**
 * Status do delivery
 * Model: Delivery
 */
routes.post('/delivery/:id', StatusDeliveryController.store); // Retirada
routes.put('/delivery/:id', StatusDeliveryController.update); // Entrega

/**
 * Visualizar encomendas
 * Model: Deliveryman
 */
routes.get('/deliverymen/:id/deliveries', DeliverymanController.show);

routes.use(authMiddleware);

/**
 * Endereços de entrega
 * Model: Recipient
 */
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.destroy);
routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);

/**
 * Entregadores (Deliverymen)
 * Model: Deliveryman
 */
routes.get('/deliverymen', DeliverymanController.index);
routes.post('/deliverymen', DeliverymanController.store);
routes.delete('/deliverymen/:id', DeliverymanController.delete);
routes.put('/deliverymen/:id', DeliverymanController.update);
routes.get('/deliverymen/:id', DeliverymanController.show);

/**
 * Avatar de Entregadores
 * Model: DeliverymanAvatar
 */
routes.post(
  '/deliverymen/avatar',
  upload.single('file'),
  DeliverymanAvatarController.store
);

/**
 * Encomendas
 * Model: Delivery
 */
routes.get('/deliveries', DeliveryController.index);
routes.post('/deliveries', DeliveryController.store);
routes.delete('/deliveries/:id', DeliveryController.delete);
routes.put('/deliveries/:id', DeliveryController.update);

/**
 * Cancelar encomenda usando id do problema
 * Models: [DeliveryProblem, Delivery]
 */
routes.delete(
  '/problem/:delivery_problem_id/cancel-delivery',
  DeliveryProblemController.delete
);

export default routes;
