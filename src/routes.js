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
 * Gestão de Entregadores (Couriers)
 */
// Avatar
routes.post(
  '/couriers/avatar',
  upload.single('file'),
  CourierAvatarController.store
);

// Lista de entregadores
routes.get('/couriers', CourierController.index);

// Cadastro de entregador
routes.post('/couriers', CourierController.store);

export default routes;
