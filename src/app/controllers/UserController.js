import User from '../models/User';

class UserController {
  async store(req, res) {
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