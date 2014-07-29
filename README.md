# Leap ARDrone - Nodebots 2014
## Control an AR Drone Parrot with a leap motion.

This project uses the leap motion to control an AR Drone parrot.

## Requires
Leap motion SDK. The leap motion daemon must be running
nodejs.
leapjs. Can be installed with npm (npm install leapjs)
ar-drone js. Can be installed with npm (npm install ar-drone)

Run the leapDrone.js file with node to begin.

    node leapDrone.js

## Controls

The drone will take off when the leap motion detects hands in its field of
view.

The drone will land when there are no longer hands in its field of view.

Left hand controls the pitch and roll. Hold the left hand out and tilt 
the hand in the relevant direction.

Right hand controls the height and yaw. The height is controlled by 
raising the right hand higher or lower relative to the left hand.

The yaw is controlled by moving the right hand forward or backward relative
to the left hand.

## Credits
Robert Wood
Brandon Surmanski
