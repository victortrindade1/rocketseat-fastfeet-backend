/**
 * Store avatar do entregador
 */
import DeliverymanAvatar from '../models/DeliverymanAvatar';

class DeliverymanAvatarController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const file = await DeliverymanAvatar.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new DeliverymanAvatarController();
