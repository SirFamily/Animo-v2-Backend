module.exports = (sequelize, Sequelize) => {
    const PetCountBooking = sequelize.define(
       'pet_count_booking',
       {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, field: 'id' },
          bookingId: { type: Sequelize.STRING(36), allowNull: false, field: 'booking_id' },
          petId: { type: Sequelize.STRING(36), allowNull: false, field: 'pet_id' },
          createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' }
       },
       {
          tableName: 'pet_count_booking',
          timestamps: false
       }
    );
 
    return PetCountBooking;
 }
 