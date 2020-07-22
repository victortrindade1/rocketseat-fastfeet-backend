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
    } catch (error) {
      // console.log(error);
      return res.status(400).json({ error: 'Error in await User.findOne().' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }
}

export default new UserController();
