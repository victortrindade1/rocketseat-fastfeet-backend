/**
 * Gestão de deliverymen (Entregadores) - CRUD
 */
import * as Yup from 'yup';
import { Op } from 'sequelize';

import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import DeliverymanAvatar from '../models/DeliverymanAvatar';

class DeliverymanController {
  async index(req, res) {
    try {
      const { page = 1, q: deliverymanFilter, limit = 5 } = req.query;
      const where = {};

      if (deliverymanFilter) {
        where.name = { [Op.iLike]: `${deliverymanFilter}%` };
      }

      const totalDeliverymen = await Deliveryman.count({ where });

      const deliverymen = await Deliveryman.findAll({
        where,
        limit,
        offset: (page - 1) * limit,
        order: [['id', 'DESC']],
        attributes: ['id', 'name', 'email'],
        include: [
          {
            model: DeliverymanAvatar,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });

      return res.json({
        limit,
        page: Number(page),
        items: deliverymen,
        total: totalDeliverymen,
        pages: Math.ceil(totalDeliverymen / limit),
      });
    } catch (error) {
      return res.status(400).json({ error: 'Error in database.' });
    }
  }

  async store(req, res) {
    try {
      // Validação: body do request
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string().email().required(),
        avatar_id: Yup.number(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation fails' });
      }

      const deliverymanExists = await Deliveryman.findOne({
        where: { email: req.body.email },
      });

      if (deliverymanExists) {
        return res.status(400).json({ error: 'Deliveryman already exists.' });
      }

      // Em vez de carregar na response todos os dados de Deliveryman, eu escolho carregar estes 4
      const { id, name, email } = await Deliveryman.create(req.body);

      return res.json({
        id,
        name,
        email,
      });
    } catch (error) {
      return res.status(400).json({ error: 'Error in database.' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const deliveryman = await Deliveryman.findByPk(id);

      if (!deliveryman) {
        return res.status(400).json({ error: 'Deliveryman does not exist.' });
      }

      // Verifica se possui entrega a fazer
      const delivery = await Delivery.findOne({
        where: { deliveryman_id: id, end_date: null },
      });

      if (delivery) {
        return res
          .status(400)
          .json({ error: 'This Deliveryman cannot be deleted' });
      }

      // Poderia, em vez de destruir, criar uma coluna com canceled_at
      await Deliveryman.destroy({ where: { id } });
      // ou
      // await deliveryman.destroy();

      return res
        .status(200)
        .json({ message: 'Deliveryman deleted successfully.' });
    } catch (err) {
      return res.status(400).json({ error: 'Error in database.' });
    }
  }

  async update(req, res) {
    try {
      // Validação: body do request
      const schema = Yup.object().shape({
        id: Yup.number().required(),
        name: Yup.string(),
        email: Yup.string().email(),
        avatar_id: Yup.number(),
      });

      const request = req.body;
      request.id = req.params.id;

      if (!(await schema.isValid(request))) {
        return res.status(400).json({ error: 'Validation fails' });
      }

      const deliveryman = await Deliveryman.findByPk(req.params.id);

      if (!deliveryman) {
        return res.status(400).json({ error: 'Deliveryman not found' });
      }

      await deliveryman.update(req.body);

      return res.json(deliveryman);
    } catch (err) {
      return res.status(400).json({ error: 'Error in update' });
    }
  }

  async show(req, res) {
    try {
      // Validação: params
      const schema = Yup.object().shape({
        id: Yup.number().required(),
      });

      const { id } = req.params;

      if (!(await schema.isValid({ id }))) {
        return res.status(400).json({ error: 'Validation fails' });
      }

      // Validation: deliveryman exists
      const deliveryman = await Deliveryman.findByPk(id, {
        attributes: ['id', 'name', 'email'],
        include: [
          {
            model: DeliverymanAvatar,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });

      if (!deliveryman) {
        return res.status(400).json({ error: 'Deliveryman does not exist.' });
      }

      return res.status(200).json(deliveryman);
    } catch (error) {
      return res.status(400).json({ error: 'Error in database' });
    }
  }
}

export default new DeliverymanController();
