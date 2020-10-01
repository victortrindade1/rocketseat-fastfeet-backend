/**
 * Gestão de deliveries (Encomendas) - Retirada e Entrega
 * Retirada: entre 08:00h e 18:00h
 * Entrega: somente com assinatura
 */
import * as Yup from 'yup';
import {
  parseISO,
  isBefore,
  isAfter,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { Op } from 'sequelize';

import Delivery from '../models/Delivery';
// import Recipient from '../models/Recipient';
// import Deliveryman from '../models/Deliveryman';
// import Signature from '../models/Signature';

class StatusDeliveryController {
  // async index(req, res) {
  //   try {
  //     const { page = 1 } = req.query;
  //     const delivery = await Delivery.findAll({
  //       // Os campos q eu quero q mostre ficam em "attributes"
  //       attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
  //       limit: 20,
  //       offset: (page - 1) * 20,
  //       order: ['id'],
  //       include: [
  //         {
  //           model: Recipient,
  //           as: 'recipient',
  //           attributes: ['id', 'name'],
  //         },
  //         {
  //           model: Deliveryman,
  //           as: 'deliveryman',
  //           attributes: ['id', 'name', 'email'],
  //         },
  //         {
  //           model: Signature,
  //           as: 'signature',
  //           attributes: ['id', 'name', 'path', 'url'],
  //         },
  //       ],
  //     });
  //     return res.json(delivery);
  //   } catch (error) {
  //     return res.status(400).json({ error: 'Error in database.' });
  //   }
  // }

  async update(req, res) {
    /**
     * Salva no banco deliveries: end_date (required), signature_id
     */
    try {
      // Validação: body do request
      const schema = Yup.object().shape({
        id: Yup.number().required(),
        end_date: Yup.date(),
        /* If has end_date, then signature is not required.
          Else, signature is required */
        signature_id: Yup.number().when('end_date', (end_date, field) =>
          end_date ? field : field.required()
        ),
      });

      const request = req.body;
      request.id = req.params.id;

      if (!(await schema.isValid(request))) {
        return res.status(400).json({ error: 'Validation fails' });
      }

      // Validation: delivery exists
      const delivery = await Delivery.findByPk(request.id);

      if (!delivery) {
        return res.status(400).json({ error: 'Delivery not found.' });
      }

      // Validation: end_date > start_date
      if (request.end_date) {
        const startDate = parseISO(delivery.start_date);
        const endDate = parseISO(request.end_date);

        if (isBefore(endDate, startDate)) {
          return res.status(400).json({ error: 'Wrong dates informed.' });
        }
      }

      await delivery.update(req.body);

      return res.json(delivery);
    } catch (error) {
      return res.status(400).json({ error: 'Error in database.' });
    }
  }

  async store(req, res) {
    /**
     * Save in table deliveries: start_date
     */
    try {
      // Validação: body do request
      const schema = Yup.object().shape({
        id: Yup.number().required(),
        start_date: Yup.date().required(),
      });

      const request = req.body;
      request.id = req.params.id;

      if (!(await schema.isValid(request))) {
        return res.status(400).json({ error: 'Validation fails' });
      }

      // Validation: Between 08am and 06pm
      const startDate = parseISO(req.body.start_date);

      const minDate = setSeconds(setMinutes(setHours(startDate, 8), 0), 0);
      const maxDate = setSeconds(setMinutes(setHours(startDate, 18), 0), 0);

      if (isBefore(startDate, minDate) || isAfter(startDate, maxDate)) {
        return res.status(400).json({
          error: 'Service is opened between 08:00am and 06:00pm. Sorry...',
        });
      }

      // Validation: delivery exists
      const delivery = await Delivery.findByPk(req.body.id);

      if (!delivery) {
        return res.status(400).json({ error: 'Delivery not found.' });
      }

      // Validation: Maximum of 5 deliveries/day
      const countDeliveries = await Delivery.count({
        where: {
          deliveryman_id: delivery.deliveryman_id,
          start_date: {
            [Op.between]: [startOfDay(startDate), endOfDay(startDate)],
          },
        },
      });

      if (countDeliveries >= 5) {
        return res
          .status(400)
          .json({ error: 'Maximum of 5 items to delivery a day.' });
      }

      await delivery.update(req.body);

      return res.json(delivery);
    } catch (error) {
      return res.status(400).json({ error: 'Error in database.' });
    }
  }

  // async delete(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const delivery = await Delivery.findByPk(id);
  //     if (!delivery) {
  //       return res.status(400).json({ error: 'Delivery does not exist.' });
  //     }
  //     await Delivery.destroy({ where: { id } });
  //     return res
  //       .status(200)
  //       .json({ message: 'Delivery deleted successfully.' });
  //   } catch (err) {
  //     return res.status(400).json({ error: 'Error in database.' });
  //   }
  // }
  // async update(req, res) {
  //   try {
  //     // Validação: body do request
  //     const schema = Yup.object().shape({
  //       product: Yup.string(),
  //       recipient_id: Yup.number(),
  //       deliveryman_id: Yup.number(),
  //       // end_date: Yup.date(),
  //       // // If has end_date, then requires signature_id
  //       // signature_id: Yup.number().when('end_date', (end_date, field) =>
  //       //   end_date ? field.required() : field
  //       // ),
  //     });
  //     if (!(await schema.isValid(req.body))) {
  //       return res.status(400).json({ error: 'Validation fails' });
  //     }
  //     // Validation: delivery exists?
  //     const delivery = await Delivery.findByPk(req.params.id);
  //     if (!delivery) {
  //       return res.status(400).json({ error: 'Delivery not found' });
  //     }
  //     // Validation: recipient and deliveryman exist?
  //     const { recipient_id, deliveryman_id } = req.body;
  //     if (recipient_id) {
  //       const recipientExists = await Recipient.findByPk(recipient_id);
  //       if (!recipientExists) {
  //         return res.status(400).json({ error: 'Recipient not found' });
  //       }
  //     }
  //     if (deliveryman_id) {
  //       const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);
  //       if (!deliverymanExists) {
  //         return res.status(400).json({ error: 'Deliveryman not found' });
  //       }
  //     }
  //     // Update Delivery
  //     await delivery.update(req.body);
  //     return res.json(delivery);
  //   } catch (err) {
  //     return res.status(400).json({ error: 'Error in update' });
  //   }
  // }
}

export default new StatusDeliveryController();
