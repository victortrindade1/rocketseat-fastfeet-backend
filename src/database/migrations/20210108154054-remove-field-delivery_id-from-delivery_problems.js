module.exports = {
  up: (queryInterface) => {
    return queryInterface.removeColumn('delivery_problems', 'delivery_id');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('delivery_problems', 'delivery_id', {
      type: Sequelize.INTEGER,
      references: { model: 'deliveries', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: false,
    });
  },
};
