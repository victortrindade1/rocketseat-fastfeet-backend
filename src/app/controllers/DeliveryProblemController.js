/**
 * CRUD - delivery problems
 */
import * as Yup from 'yup';
import { Op } from 'sequelize';

import Mail from '../../lib/Mail';

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
        error: 'Error in database. Sorry.',
        // description: error.message,
      });
    }
  }

  async index(req, res) {
    try {
      // Eu poderia fazer dinâmico com filtro de deliveries opened e closed
      // List all deliveries that have problem

      const { page = 1 } = req.query;

      const deliveriesProblems = await DeliveryProblem.findAll({
        attributes: ['id', 'description'],
        limit: 20,
        offset: (page - 1) * 20,
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

      if (
        // If Empty Array
        typeof deliveriesProblems !== 'undefined' &&
        deliveriesProblems.length === 0
      ) {
        return res.json({ message: ' No deliveries with problems found' });
      }

      return res.status(200).json(deliveriesProblems);
    } catch (error) {
      return res.status(400).json({ error: 'Database error' });
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
      // const deliveryId = req.params.delivery_id;
      const request = req.body;
      request.delivery_problem_id = req.params.delivery_problem_id;

      const schema = Yup.object().shape({
        delivery_problem_id: Yup.number().required(),
        canceled_at: Yup.date().required(),
      });

      if (!(await schema.isValid(request))) {
        return res.status(400).json({ error: 'Validation fails.' });
      }

      // Validation: delivery problem exists?
      const deliveryProblem = await DeliveryProblem.findByPk(
        request.delivery_problem_id
      );

      if (!deliveryProblem) {
        return res.status(400).json({ error: 'Delivery problem not found' });
      }

      // Validation: delivery exists
      // const delivery = await Delivery.findByPk(deliveryProblem.delivery_id);
      const delivery = await Delivery.findOne({
        where: {
          id: deliveryProblem.delivery_id,
        },
        // Include Recipient to send e-mail
        include: [
          {
            model: Recipient,
            as: 'recipient',
          },
        ],
      });

      if (!delivery) {
        return res.status(400).json({ error: 'delivery not found' });
      }

      // Validation: delivery is closed
      if (
        (delivery.canceled_at !== null || delivery.end_date !== null) &&
        delivery.start_date !== null
      ) {
        return res.status(400).json({ error: 'This delivery is closed.' });
      }

      /**
       * Poderia apenas dar um valor pra delivery.canceled_at e em vez de fazer
       * update, faria um save. Assim:
       * delivery.canceled_at = req.body.canceled_at;
       * await delivery.save();
       * */
      await delivery.update(req.body);

      // Send mail to deliveryman
      const deliveryman = await Deliveryman.findByPk(delivery.deliveryman_id);

      if (!deliveryman) {
        return res.status(400).json({ error: 'Deliveryman not found' });
      }

      await Mail.sendMail({
        to: `${deliveryman.name} <${deliveryman.email}>`,
        subject: 'Encomenda cancelada',
        template: 'newDelivery',
        context: {
          deliveryman: deliveryman.name,
          product: delivery.product,
          zipcode: delivery.recipient.zipcode,
          street: delivery.recipient.street,
          number: delivery.recipient.number,
          city: delivery.recipient.city,
          state: delivery.recipient.state,
          country: delivery.recipient.country,
          complement: delivery.recipient.complement,
          name: delivery.recipient.name,
          phone: delivery.recipient.phone,
        },
      });

      return res.json(delivery);
    } catch (error) {
      return res.status(400).json({ error: 'Database error.' });
    }
  }
}

export default new DeliveryProblemController();
