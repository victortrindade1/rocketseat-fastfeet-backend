/**
 * Gestão de Couriers (Entregadores) - CRUD
 */
import * as Yup from 'yup';
import Courier from '../models/Courier';
import CourierAvatar from '../models/CourierAvatar';

class CourierController {
  async index(req, res) {
    try {
      const { page = 1 } = req.query;

      const couriers = await Courier.findAll({
        // Os campos q eu quero q mostre ficam em "attributes"
        attributes: ['id', 'name', 'email', 'avatar_id'],
        limit: 20,
        offset: (page - 1) * 20,
        include: [
          {
            model: CourierAvatar,
            as: 'avatar',
            attributes: ['name', 'path', 'url'],
          },
        ],
      });

      return res.json(couriers);
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

      const courierExists = await Courier.findOne({
        where: { email: req.body.email },
      });

      if (courierExists) {
        return res.status(400).json({ error: 'Courier already exists.' });
      }

      // Em vez de carregar na response todos os dados de Courier, eu escolho carregar estes 4
      const { id, name, email } = await Courier.create(req.body);

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

      const courier = await Courier.findByPk(id);

      if (!courier) {
        return res.status(400).json({ error: 'Courier does not exist.' });
      }

      // Poderia, em vez de destruir, criar uma coluna com canceled_at
      await Courier.destroy({ where: { id } });

      return res.status(200).json({ message: 'Courier deleted successfully.' });
    } catch (err) {
      return res.status(400).json({ error: 'Error in database.' });
    }
  }

  async update(req, res) {
    try {
      // Validação: body do request
      const schema = Yup.object().shape({
        name: Yup.string(),
        email: Yup.string().email(),
        avatar_id: Yup.number(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation fails' });
      }

      const courier = await Courier.findByPk(req.params.id);

      if (!courier) {
        return res.status(400).json({ error: 'Courier not found' });
      }

      await courier.update(req.body);

      return res.json(courier);
    } catch (err) {
      return res.status(400).json({ error: 'Error in update' });
    }
  }
}

export default new CourierController();
