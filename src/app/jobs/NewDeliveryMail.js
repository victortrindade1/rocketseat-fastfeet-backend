import Mail from '../../lib/Mail';

class NewDeliveryMail {
  /**
   * O get dá a liberdade de chamarmos o valor do método sem a necessidade de
   * criar um constructor. Ou seja, não precisa disparar o método
   * Cancellation.key(), apenas um Cancellation.key já acessa
   */
  get key() {
    return 'NewDeliveryMail';
  }

  async handle({ data }) {
    const { deliveryman, product, recipient } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Há uma nova encomenda para ser entregue!',
      template: 'newDelivery',
      context: {
        deliveryman: deliveryman.name,
        product,
        zipcode: recipient.zipcode,
        street: recipient.street,
        number: recipient.number,
        city: recipient.city,
        state: recipient.state,
        country: recipient.country,
        complement: recipient.complement,
        name: recipient.name,
        phone: recipient.phone,
      },
    });
  }
}

export default new NewDeliveryMail();
