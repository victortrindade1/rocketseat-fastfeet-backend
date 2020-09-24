import Sequelize from 'sequelize';

import User from '../app/models/User';
import Recipient from '../app/models/Recipient';
import Deliveryman from '../app/models/Deliveryman';
import DeliverymanAvatar from '../app/models/DeliverymanAvatar';
import Delivery from '../app/models/Delivery';
import Signature from '../app/models/Signature';

import databaseConfig from '../config/database';

const models = [
  User,
  Recipient,
  Deliveryman,
  DeliverymanAvatar,
  Delivery,
  Signature,
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }
}

export default new Database();
