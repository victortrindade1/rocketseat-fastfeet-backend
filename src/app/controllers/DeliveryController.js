/**
 * Gestão de deliverymen (Entregadores) - CRUD
 */
// import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import Signature from '../models/Signature';

class DeliveryController {
  async index(req, res) {
    try {
      const { page = 1 } = req.query;

      const delivery = await Delivery.findAll({
        // Os campos q eu quero q mostre ficam em "attributes"
        attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
        limit: 20,
        offset: (page - 1) * 20,
        order: ['id'],
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
      });

      return res.json(delivery);
    } catch (error) {
      return res.status(400).json({ error: 'Error in database.' });
    }
  }

  // async store(req, res) {
  //   try {
  //     // Validação: body do request
  //     const schema = Yup.object().shape({
  //       name: Yup.string().required(),
  //       email: Yup.string().email().required(),
  //       avatar_id: Yup.number(),
  //     });

  //     if (!(await schema.isValid(req.body))) {
  //       return res.status(400).json({ error: 'Validation fails' });
  //     }

  //     const deliverymanExists = await Deliveryman.findOne({
  //       where: { email: req.body.email },
  //     });

  //     if (deliverymanExists) {
  //       return res.status(400).json({ error: 'Deliveryman already exists.' });
  //     }

  //     // Em vez de carregar na response todos os dados de Deliveryman, eu escolho carregar estes 4
  //     const { id, name, email } = await Deliveryman.create(req.body);

  //     return res.json({
  //       id,
  //       name,
  //       email,
  //     });
  //   } catch (error) {
  //     return res.status(400).json({ error: 'Error in database.' });
  //   }
  // }

  // async delete(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const deliveryman = await Deliveryman.findByPk(id);

  //     if (!deliveryman) {
  //       return res.status(400).json({ error: 'Deliveryman does not exist.' });
  //     }

  //     // Poderia, em vez de destruir, criar uma coluna com canceled_at
  //     await Deliveryman.destroy({ where: { id } });

  //     return res
  //       .status(200)
  //       .json({ message: 'Deliveryman deleted successfully.' });
  //   } catch (err) {
  //     return res.status(400).json({ error: 'Error in database.' });
  //   }
  // }

  // async update(req, res) {
  //   try {
  //     // Validação: body do request
  //     const schema = Yup.object().shape({
  //       name: Yup.string(),
  //       email: Yup.string().email(),
  //       avatar_id: Yup.number(),
  //     });

  //     if (!(await schema.isValid(req.body))) {
  //       return res.status(400).json({ error: 'Validation fails' });
  //     }

  //     const deliveryman = await Deliveryman.findByPk(req.params.id);

  //     if (!deliveryman) {
  //       return res.status(400).json({ error: 'Deliveryman not found' });
  //     }

  //     await deliveryman.update(req.body);

  //     return res.json(deliveryman);
  //   } catch (err) {
  //     return res.status(400).json({ error: 'Error in update' });
  //   }
  // }
}

export default new DeliveryController();
