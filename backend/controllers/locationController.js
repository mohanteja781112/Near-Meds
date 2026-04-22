import SavedLocation from '../models/SavedLocation.js';
export const saveLocation = async (req, res) => {
  try {
    const { label, address, coordinates, source, isDefault } = req.body;
    if (isDefault) {
      await SavedLocation.updateMany(
        { userId: req.user.id, isDefault: true },
        { isDefault: false }
      );
    }

    const location = await SavedLocation.create({
      userId: req.user.id,
      label,
      address,
      coordinates,
      source,
      isDefault
    });

    res.status(201).json(location);
  } catch (error) {
    console.error('Save Location Error:', error);
    res.status(500).json({ message: 'Server error saving location' });
  }
};

export const getUserLocations = async (req, res) => {
  try {
    const locations = await SavedLocation.find({ userId: req.user.id })
      .sort({ isDefault: -1, timestamp: -1 }); 
    
    res.status(200).json(locations);
  } catch (error) {
    console.error('Get Locations Error:', error);
    res.status(500).json({ message: 'Server error fetching locations' });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const location = await SavedLocation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    if (location.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await location.deleteOne();

    res.status(200).json({ message: 'Location removed' });
  } catch (error) {
    console.error('Delete Location Error:', error);
    res.status(500).json({ message: 'Server error deleting location' });
  }
};

export const updateUserLocation = async (req, res) => {
    try {
        const { lat, lng, address } = req.body;
        let location = await SavedLocation.findOne({ userId: req.user.id, label: 'Current Location' });
        
        if (location) {
            location.coordinates = { lat, lng };
            if (address) location.address = address;
            location.timestamp = Date.now();
            await location.save();
        } else {
             location = await SavedLocation.create({
                userId: req.user.id,
                label: 'Current Location',
                address: address || 'Unknown',
                coordinates: { lat, lng },
                source: 'GPS',
                isDefault: true
            });
        }
        res.status(200).json(location);
    } catch (error) {
        console.error("Update Location Error:", error);
        res.status(500).json({ message: "Server error updating location" });
    }
};
