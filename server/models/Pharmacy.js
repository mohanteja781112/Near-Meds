import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pharmacy name is required'],
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    fullAddress: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], //[longitude,latitude]
      required: true
    }
  },
  operatingHours: {
    open: String,
    close: String,
    is24Hours: {
      type: Boolean,
      default: false
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  contact: {
    phone: String,
    email: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

//Create geospatial index for location searches
pharmacySchema.index({ location: '2dsphere' });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

export default Pharmacy;
