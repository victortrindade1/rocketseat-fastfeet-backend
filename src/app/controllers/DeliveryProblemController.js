/**
 * CRUD - delivery problems
 */
import * as Yup from 'yup';
import { Op } from 'sequelize';

// import Mail from '../../lib/Mail';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

class DeliveryProblemController {
  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        // deliveryman_id: Yup.number().required(),
        delivery_id: Yup.number().required(),
        description: Yup.string().required(),
      });

      const request = req.body;
      request.delivery_id = req.params.delivery_id;

      if (!(await schema.isValid(request))) {
        return res.status(400).json({ error: 'Validation fails.' });
      }

      // Validation: delivery exists
      const delivery = await Delivery.findByPk(request.delivery_id);

      if (!delivery) {
        return res.status(400).json({ error: 'delivery not found' });
      }

      // Validation: delivery is opened
      if (delivery.end_date !== null) {
        return res.status(400).json({ error: 'Delivery is finished.' });
      }

      const { id, delivery_id, description } = await DeliveryProblem.create(
        request
      );

      return res.status(200).json({
        id,
        delivery_id,
        description,
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Error in database. Sorryy.',
        // description: error.message,
      });
    }
  }

  async index(req, res) {
    try {
      const { page = 1, limit = 5 } = req.query;

      const totalProblems = await DeliveryProblem.count();

      const deliveriesProblems = await DeliveryProblem.findAll({
        attributes: ['id', 'description'],
        limit,
        offset: (page - 1) * limit,
        order: [['id', 'DESC']],
        include: [
          {
            model: Delivery,
            as: 'delivery',
            attributes: ['id', 'product', 'start_date'],
            where: {
              end_date: {
                [Op.is]: null,
              },
            },
            include: [
              {
                model: Recipient,
                as: 'recipient',
                attributes: ['id', 'name', 'city'],
              },
              {
                model: Deliveryman,
                as: 'deliveryman',
                attributes: ['id', 'name', 'email'],
              },
            ],
          },
        ],
      });

      // if (
      //   // If Empty Array
      //   typeof deliveriesProblems !== 'undefined' &&
      //   deliveriesProblems.length === 0
      // ) {
      //   return res.json({ message: ' No deliveries with problems found' });
      // }

      return res.status(200).json({
        limit,
        page: Number(page),
        items: deliveriesProblems,
        total: totalProblems,
        pages: Math.ceil(totalProblems / limit),
      });
    } catch (error) {
      return res.status(400).json({ error: error.description });
    }
  }

  async show(req, res) {
    try {
      const deliveryId = req.params.delivery_id;

      const schema = Yup.object().shape({
        deliveryId: Yup.number().required(),
      });

      if (!(await schema.isValid({ deliveryId }))) {
        return res.status(400).json({ error: 'Validation fails.' });
      }

      // Validation: deliveryId is valid?
      const deliveryExists = await Delivery.findByPk(deliveryId);

      if (!deliveryExists) {
        return res.status(400).json({ error: 'Delivery not found' });
      }

      const deliveryProblems = await DeliveryProblem.findAll({
        where: {
          delivery_id: deliveryId,
        },
        attributes: ['id', 'description'],
      });

      return res.json(deliveryProblems);
    } catch (error) {
      return res.status(400).json({ error: 'Error in database' });
    }
  }

  async delete(req, res) {
    try {
      const deliveryProblemId = req.params.delivery_problem_id;

      // Validation: delivery problem exists?
      const deliveryProblem = await DeliveryProblem.findByPk(deliveryProblemId);

      if (!deliveryProblem) {
        return res.status(400).json({ error: 'Delivery problem not found' });
      }

      // Validation: delivery exists
      const delivery = await Delivery.findByPk(deliveryProblem.delivery_id, {
        include: [
          {
            model: Recipient,
            as: 'recipient',
          },
          {
            model: Deliveryman,
            as: 'deliveryman',
          },
        ],
      });

      if (!delivery) {
        return res.status(500).json({
          error: 'The delivery that references this problem was not found',
        });
      }

      const { canceled_at } = await delivery.update({
        canceled_at: new Date(),
      });

      delivery.canceled_at = canceled_at;

      await DeliveryProblem.destroy({ where: { id: deliveryProblemId } });

      // Send mail to deliveryman
      await Queue.add(CancellationMail.key, {
        delivery,
        deliveryProblem,
      });

      return res.json(delivery);
    } catch (error) {
      return res.status(400).json({ error: 'Database error.' });
    }
  }
}

export default new DeliveryProblemController();
