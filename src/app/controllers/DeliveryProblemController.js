/**
 * CRUD - delivery problems
 */
import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';

class DeliveryProblemController {
  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        // deliveryman_id: Yup.number().required(),
        delivery_id: Yup.number().required(),
        description: Yup.string().required(),
      });

      const request = req.body;
      request.delivery_id = req.params.delivery_id;

      if (!(await schema.isValid(request))) {
        return res.status(400).json({ error: 'Validation fails.' });
      }

      // Validation: delivery exists
      const delivery = await Delivery.findByPk(request.delivery_id);

      if (!delivery) {
        return res.status(400).json({ error: 'delivery not found' });
      }

      // Validation: delivery is opened
      if (delivery.end_date !== null) {
        return res.status(400).json({ error: 'Delivery is finished.' });
      }

      const { id, delivery_id, description } = await DeliveryProblem.create(
        request
      );

      return res.status(200).json({
        id,
        delivery_id,
        description,
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Error in database. Sorry.',
        // description: error.message,
      });
    }
  }
}

export default new DeliveryProblemController();
