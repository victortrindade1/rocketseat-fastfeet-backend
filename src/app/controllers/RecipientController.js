/**
 * Controller para cadastrar/atualizar destinatários
 */
import * as Yup from 'yup';
import { Op } from 'sequelize';

import Recipient from '../models/Recipient';
import Delivery from '../models/Delivery';

class RecipientController {
  async store(req, res) {
    // Validação: body do request
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      phone: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string().notRequired(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipcode: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const {
      name,
      phone,
      street,
      number,
      complement,
      state,
      city,
      zipcode,
    } = req.body;

    const { id } = await Recipient.create({
      name,
      phone,
      street,
      number,
      complement,
      state,
      city,
      zipcode,
    });

    return res.json({
      id,
      name,
      phone,
      street,
      number,
      complement,
      state,
      city,
      zipcode,
    });
  }

  async update(req, res) {
    // Validação: body do request
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      name: Yup.string(),
      phone: Yup.string(),
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      zipcode: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    const {
      name,
      phone,
      street,
      number,
      complement,
      state,
      city,
      zipcode,
    } = req.body;

    await recipient.update({
      name,
      phone,
      street,
      number,
      complement,
      state,
      city,
      zipcode,
    });

    return res.json({});
  }

  async index(req, res) {
    try {
      const { q: recipientName, page = 1, limit = 5 } = req.query;
      const where = {};

      if (recipientName) {
        where.name = { [Op.iLike]: `${recipientName}%` };
      }

      const totalRecipients = await Recipient.count({ where });

      const recipients = await Recipient.findAll({
        where,
        limit,
        offset: (page - 1) * limit,
        order: [['id', 'DESC']],
        attributes: [
          'id',
          'name',
          'street',
          'number',
          'complement',
          'state',
          'city',
          'zipcode',
        ],
      });

      return res.json({
        limit,
        page: Number(page),
        items: recipients,
        total: totalRecipients,
        pages: Math.ceil(totalRecipients / limit),
      });
    } catch (error) {
      return res.status(400).json({ error: 'Error in database.' });
    }
  }

  async show(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id, {
      attributes: [
        'id',
        'name',
        'street',
        'number',
        'complement',
        'state',
        'city',
        'zip_code',
      ],
    });

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    return res.json(recipient);
  }

  async destroy(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const deliveries = await Delivery.findOne({
      where: {
        recipient_id: recipient.id,
        signature_id: null,
      },
    });

    if (deliveries) {
      return res
        .status(400)
        .json({ error: 'This Recipient still has an delivery to receive' });
    }

    await recipient.destroy();
    return res.json({});
  }
}

export default new RecipientController();
