/**
 * Controller para salvar novo arquivo signature do recipient no delivery
 */
import Signature from '../models/Signature';

class DeliverySignatureController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const file = await Signature.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new DeliverySignatureController();
