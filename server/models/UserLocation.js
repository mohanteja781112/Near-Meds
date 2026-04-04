import mongoose from 'mongoose';

const userLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], //[longitude, latitude]
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  label: {
    type: String, //Eg: "Home", "Work", "Emergency Search"
    default: 'Manual Entry'
  }
});

//Create index for quick retrieval by user and time
userLocationSchema.index({ userId: 1, timestamp: -1 });

const UserLocation = mongoose.model('UserLocation', userLocationSchema);

export default UserLocation;
