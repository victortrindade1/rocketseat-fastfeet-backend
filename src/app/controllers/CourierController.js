/**
 * Gestão de Couriers (Entregadores) - CRUD
 */
import Courier from '../models/Courier';
import CourierAvatar from '../models/CourierAvatar';

class CourierController {
  async index(req, res) {
    const couriers = await Courier.findAll({
      // Os campos q eu quero q mostre ficam em "attributes"
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: CourierAvatar,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(couriers);
  }

  async store(req, res) {
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
  }
}

export default new CourierController();
