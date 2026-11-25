'use strict';

// Set useClassicContent to true for a full visual and story-text rollback.
// With it off, the switches and exception lists below apply independently.
const BB_CONTENT={
  useClassicContent:false,
  newStoryArenas:true,
  scatteredPurpleDust:true,
  newMosquitoArena:true,
  revisedGardenUpdates:true,

  // Exact arena names, for example ["Garden Grove", "Mossy Creek"].
  classicStoryAreas:[],
  classicDustAreas:[],

  // Boss wave numbers, for example [15, 25].
  classicGardenUpdateWaves:[]
};
