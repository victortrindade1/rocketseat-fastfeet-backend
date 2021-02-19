import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class CancellationMail {
  // O get dá a liberdade de chamarmos o valor do método sem a necessidade de criar um constructor. Ou seja, não precisa disparar o método Cancellation.key(), apenas um Cancellation.key já acessa
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { delivery, deliveryProblem } = data;

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Encomenda cancelada',
      template: 'cancellation',
      context: {
        deliveryman: delivery.deliveryman.name,
        product: delivery.product,
        zipcode: delivery.recipient.zipcode,
        street: delivery.recipient.street,
        number: delivery.recipient.number,
        city: delivery.recipient.city,
        state: delivery.recipient.state,
        country: delivery.recipient.country,
        complement: delivery.recipient.complement,
        recipient: delivery.recipient.name,
        date: format(
          parseISO(delivery.canceled_at),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
        description: deliveryProblem.description,
      },
    });
  }
}

export default new CancellationMail();
