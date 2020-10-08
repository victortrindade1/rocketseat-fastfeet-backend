import Mail from '../../lib/Mail';

class CancellationMail {
  // O get dá a liberdade de chamarmos o valor do método sem a necessidade de criar um constructor. Ou seja, não precisa disparar o método Cancellation.key(), apenas um Cancellation.key já acessa
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { deliveryman, delivery } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Encomenda cancelada',
      template: 'cancellation',
      context: {
        deliveryman: deliveryman.name,
        product: delivery.product,
        zipcode: delivery.recipient.zipcode,
        street: delivery.recipient.street,
        number: delivery.recipient.number,
        city: delivery.recipient.city,
        state: delivery.recipient.state,
        country: delivery.recipient.country,
        complement: delivery.recipient.complement,
        name: delivery.recipient.name,
        phone: delivery.recipient.phone,
      },
    });
  }
}

export default new CancellationMail();
