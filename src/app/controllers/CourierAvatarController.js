/**
 * Store avatar do entregador
 */
import CourierAvatar from '../models/CourierAvatar';

class CourierAvatarController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const file = await CourierAvatar.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new CourierAvatarController();
