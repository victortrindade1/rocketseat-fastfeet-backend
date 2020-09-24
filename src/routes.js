import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import CourierAvatarController from './app/controllers/CourierAvatarController';
import CourierController from './app/controllers/CourierController';

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
 * Entregadores (Couriers)
 */
routes.get('/couriers', CourierController.index);
routes.post('/couriers', CourierController.store);
routes.delete('/couriers/:id', CourierController.delete);
routes.put('/couriers/:id', CourierController.update);

/**
 * Avatar de Entregadores
 */
routes.post(
  '/couriers/avatar',
  upload.single('file'),
  CourierAvatarController.store
);

export default routes;
