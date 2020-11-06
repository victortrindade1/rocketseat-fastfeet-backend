/**
 * Gestão de deliveries (Encomendas) - CRUD
 */
import * as Yup from 'yup';
import { Op } from 'sequelize';

// import Mail from '../../lib/Mail';
import Queue from '../../lib/Queue';
import NewDeliveryMail from '../jobs/NewDeliveryMail';

import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import DeliverymanAvatar from '../models/DeliverymanAvatar';
import Signature from '../models/Signature';

class DeliveryController {
  async index(req, res) {
    try {
      const { page = 1, q: productFilter } = req.query;

      const response = productFilter
        ? await Delivery.findAll({
            where: {
              product: {
                // Somente com "[Op.iLike]: productFilter" não acha de trás pra frente
                [Op.iLike]: `${productFilter}%`,
              },
            },
            order: ['id'],
            attributes: [
              'id',
              'product',
              'start_date',
              'end_date',
              'canceled_at',
            ],
            include: [
              {
                model: Recipient,
                as: 'recipient',
                attributes: ['id', 'name'],
              },
              {
                model: Deliveryman,
                as: 'deliveryman',
                attributes: ['id', 'name', 'email'],
              },
              {
                model: Signature,
                as: 'signature',
                attributes: ['id', 'name', 'path', 'url'],
              },
            ],
          })
        : await Delivery.findAll({
            // Os campos q eu quero q mostre ficam em "attributes"
            attributes: [
              'id',
              'product',
              'canceled_at',
              'start_date',
              'end_date',
            ],
            limit: 20,
            offset: (page - 1) * 20,
            order: ['id'],
            include: [
              {
                model: Recipient,
                as: 'recipient',
                attributes: [
                  'id',
                  'name',
                  'phone',
                  'street',
                  'number',
                  'complement',
                  'state',
                  'city',
                  'zipcode',
                ],
              },
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
              {
                model: Signature,
                as: 'signature',
                attributes: ['id', 'name', 'path', 'url'],
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
        product: Yup.string().required(),
        recipient_id: Yup.number().required(),
        deliveryman_id: Yup.number().required(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation fails' });
      }

      // Check if recipient and deliveryman exists
      const recipient = await Recipient.findByPk(req.body.recipient_id);

      const deliveryman = await Deliveryman.findByPk(req.body.deliveryman_id);

      if (!(recipient || deliveryman)) {
        return res
          .status(400)
          .json({ error: 'Recipient and/or Deliveryman do not exist.' });
      }

      const {
        id,
        product,
        recipient_id,
        deliveryman_id,
      } = await Delivery.create(req.body);

      await Queue.add(NewDeliveryMail.key, {
        deliveryman,
        product,
        recipient,
      });

      return res.json({
        id,
        product,
        recipient_id,
        deliveryman_id,
      });
    } catch (error) {
      return res.status(400).json({ error: 'Error in database.' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const delivery = await Delivery.findByPk(id);

      if (!delivery) {
        return res.status(400).json({ error: 'Delivery does not exist.' });
      }

      await Delivery.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: 'Delivery deleted successfully.' });
    } catch (err) {
      return res.status(400).json({ error: 'Error in database.' });
    }
  }

  async update(req, res) {
    try {
      // Validação: body do request
      const schema = Yup.object().shape({
        product: Yup.string(),
        recipient_id: Yup.number(),
        deliveryman_id: Yup.number(),
        id: Yup.number().required(),
        // end_date: Yup.date(),
        // // If has end_date, then requires signature_id
        // signature_id: Yup.number().when('end_date', (end_date, field) =>
        //   end_date ? field.required() : field
        // ),
      });

      const { product, recipient_id, deliveryman_id } = req.body;
      const { id } = req.params;

      const deliveryRequest = { id, product, recipient_id, deliveryman_id };

      if (!(await schema.isValid(deliveryRequest))) {
        return res.status(400).json({ error: 'Validation fails' });
      }

      // Validation: delivery exists?
      const delivery = await Delivery.findByPk(id);

      if (!delivery) {
        return res.status(400).json({ error: 'Delivery not found' });
      }

      // Validation: recipient and deliveryman exist?
      // const { recipient_id, deliveryman_id } = req.body;

      if (recipient_id) {
        const recipientExists = await Recipient.findByPk(recipient_id);

        if (!recipientExists) {
          return res.status(400).json({ error: 'Recipient not found' });
        }
      }

      if (deliveryman_id) {
        const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

        if (!deliverymanExists) {
          return res.status(400).json({ error: 'Deliveryman not found' });
        }
      }

      // Update Delivery
      await delivery.update(req.body);

      return res.json(delivery);
    } catch (err) {
      return res.status(400).json({ error: 'Error in update' });
    }
  }
}

export default new DeliveryController();
