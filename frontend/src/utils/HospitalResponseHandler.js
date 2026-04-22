export const simulateHospitalResponses = (hospitals, onAccepted) => {
  // We need to assign random delays between 5 and 10 seconds (5000 to 10000 ms)
  // And pick the fastest one

  if (!hospitals || hospitals.length === 0) {
    onAccepted(null);
    return;
  }

  // Create an array mapping hospital to a computed delay
  const hospitalDelays = hospitals.map(hospital => ({
    hospital,
    delay: Math.floor(Math.random() * 5000) + 5000 // 5000ms to 9999ms
  }));

  // Find the fastest responder
  hospitalDelays.sort((a, b) => a.delay - b.delay);
  const fastest = hospitalDelays[0];

  console.log(`[Hospital Simulation] Broadcasting to ${hospitals.length} hospitals.`);
  console.log(`[Hospital Simulation] Fastest responder: ${fastest.hospital.name} with delay ${fastest.delay}ms`);

  // Simulate the delay
  setTimeout(() => {
    onAccepted(fastest.hospital);
  }, fastest.delay);
};
