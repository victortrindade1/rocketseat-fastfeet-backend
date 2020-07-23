/**
 * Controller para cadastrar/atualizar destinatários
 */
import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    // Validação: body do request
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      phone: Yup.string(),
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      zipcode: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Validação: destinatário existe
    try {
      const recipientExists = await Recipient.findOne({
        where: { name: req.body.name },
      });

      if (recipientExists) {
        return res.status(400).json({ error: 'Recipient already exists.' });
      }
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: 'Error when searching in DB' });
    }

    // Insere na tabela
    try {
      const {
        id,
        name,
        phone,
        street,
        number,
        complement,
        state,
        city,
        zipcode,
      } = await Recipient.create(req.body);

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
    } catch (err) {
      return res.status(400).json({ error: 'Erro ao inserir no banco' });
    }
  }
}

export default new RecipientController();
