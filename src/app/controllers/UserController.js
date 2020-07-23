import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    // Validação: body do request
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Validação: user existe
    try {
      const userExists = await User.findOne({
        where: { email: req.body.email },
      });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    } catch (err) {
      // console.log(error);
      return res.status(400).json({ error: 'Erro ao buscar no banco' });
    }

    // Insere na tabela
    try {
      const { id, name, email } = await User.create(req.body);

      return res.json({
        id,
        name,
        email,
      });
    } catch (err) {
      return res.status(400).json({ error: 'Erro ao inserir no banco' });
    }
  }
}

export default new UserController();
