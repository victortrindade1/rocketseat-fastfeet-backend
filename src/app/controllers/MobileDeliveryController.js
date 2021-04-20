import { Op } from 'sequelize';

import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import DeliverymanAvatar from '../models/DeliverymanAvatar';
import Signature from '../models/Signature';

class MobileDeliveryController {
  async index(req, res) {
    try {
      const { page = 1, q: filterPendingDelivered = '', limit = 5 } = req.query;

      const deliverymanId = req.params.id;

      const where = {};

      where.deliveryman_id = { [Op.eq]: deliverymanId };

      if (filterPendingDelivered === 'pending') {
        where.canceled_at = { [Op.is]: null };
        // where.start_date = { [Op.is]: null };
        where.end_date = { [Op.is]: null };
      }

      if (filterPendingDelivered === 'delivered') {
        where.end_date = { [Op.ne]: null };
      }

      const totalDeliveries = await Delivery.count({ where });
      const deliveries = await Delivery.findAll({
        where,
        limit,
        offset: (page - 1) * limit,
        order: [['id', 'DESC']],
        attributes: [
          'id',
          'product',
          'start_date',
          'end_date',
          'canceled_at',
          'created_at',
        ],
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

      return res.json({
        limit,
        page: Number(page),
        items: deliveries,
        total: totalDeliveries,
        pages: Math.ceil(totalDeliveries / limit),
      });
    } catch (error) {
      return res.status(400).json({ error: 'Error in database.' });
    }
  }
}

export default new MobileDeliveryController();
