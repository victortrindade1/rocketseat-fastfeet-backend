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
      const { page = 1, q: deliverymanFilter } = req.query;

      const response = deliverymanFilter
        ? await Deliveryman.findAll({
            where: {
              name: {
                [Op.iLike]: `${deliverymanFilter}%`,
              },
            },
            attributes: ['id', 'name', 'email'],
            order: ['id'],
            include: [
              {
                model: DeliverymanAvatar,
                as: 'avatar',
                attributes: ['id', 'path', 'url'],
              },
            ],
          })
        : await Deliveryman.findAll({
            // Os campos q eu quero q mostre ficam em "attributes"
            attributes: ['id', 'name', 'email'],
            order: ['id'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [
              {
                model: DeliverymanAvatar,
                as: 'avatar',
                attributes: ['id', 'path', 'url'],
              },
            ],
          });

      return res.json(response);
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

      // Poderia, em vez de destruir, criar uma coluna com canceled_at
      await Deliveryman.destroy({ where: { id } });

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
      const deliverymanExists = await Deliveryman.findByPk(id);

      if (!deliverymanExists) {
        return res.status(400).json({ error: 'Deliveryman does not exist.' });
      }

      const deliveries = await Delivery.findAll({
        where: {
          deliveryman_id: id,
          canceled_at: {
            [Op.is]: null,
          },
          end_date: {
            [Op.is]: null,
          },
        },
        attributes: ['id', 'product', 'start_date'],
        include: [
          {
            model: Deliveryman,
            as: 'deliveryman',
            attributes: ['id', 'name', 'email'],
            include: [
              {
                model: DeliverymanAvatar,
                as: 'avatar',
                attributes: ['id', 'path', 'url'],
              },
            ],
          },
        ],
      });

      return res.status(200).json(deliveries);
    } catch (error) {
      return res.status(400).json({ error: 'Error in database' });
    }
  }
}

export default new DeliverymanController();
