import jwt from 'jsonwebtoken';
import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    /**
     * Se eu declarar const user, eu somente poderei usar dentro do escopo do
     * primeiro try{}. Pra acessar fora deste escopo, eu declaro com let fora do
     * try{}.
     */
    let user;

    // Verifica se usuário existe
    try {
      user = await User.findOne({ where: { email } });
    } catch (err) {
      return res.status(401).json({ error: 'Erro ao buscar usuário' });
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    // Compara password com o hash pelo bcrypt
    try {
      if (!(await user.checkPassword(password))) {
        return res.status(401).json({ error: 'Password does not match.' });
      }
    } catch (err) {
      return res
        .status(401)
        .json({ error: 'Erro ao comparar hash pelo bcrypt' });
    }

    // Cria token de validação
    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.jwtKey, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
