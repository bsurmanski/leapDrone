leap = require('leapjs');
ardrone = require('ar-drone');

var client = ardrone.createClient();

// limits 'val' between -1 and 1
function limit(val) {
    if(val > 1) {
        return 1;
    }

    if(val < -1) {
        return -1;
    }

    return val;
}

// returns value between -1 to 1 representing the difference between left and right hand Y(vertical) position. Used for altitude control
function getYDelta(pos1, pos2) {
    return limit((pos2[1] - pos1[1]) / 200);
}

// returns value between -1 to 1 representing the difference between left and right hand Z(forward) position. Used for yaw control
function getZDelta(pos1, pos2) {
    return limit((pos2[2] - pos1[2]) / 200);
}

// searches through hands array provided by leap motion, and selects the left most hand; assumes this is left hand
function getLeftHand(hands) {
    var left = null;

    for(i = 0; i < hands.length; i++) {
        var hand = hands[i]
        if(left == null || hand.palmPosition[0] < left.palmPosition[0]) {
            left = hand;
        }
    }

    return left;
}

// searches through hands array provided by leap motion, and selects the right most hand; assumes this is right hand
function getRightHand(hands) {
    var right = null;

    for(i = 0; i < hands.length; i++) {
        var hand = hands[i]
        if(right == null || hand.palmPosition[0] > right.palmPosition[0]) {
            right = hand;
        }
    }

    return right;
}

function logHand(name, hand) {
    console.log(name + ": " + "pos: " + hand.palmPosition + ", norm: " + hand.palmNormal);
}


// is the drone in the air?
var inAir = false;

leap.loop(function(frame) {
    if(inAir) {

        // if we see no fingers, either the pilot took their hands away or closed their fists.
        // This means we should land the drone
        if(frame.fingers.length == 0) {
            client.land();
            inAir = false;
        }

        // if we see hands
        if(frame.hands.length >= 1) {

            // for these variables '1' means left hand, '2' means right hand.
            // hands, positions, normals; Don't need right hand normal
            var hand1 = getLeftHand(frame.hands);
            var pos1 = hand1.palmPosition;
            var norm1 = hand1.palmNormal;
            var hand2 = getRightHand(frame.hands);
            var pos2 = hand2.palmPosition;

            // get the Y axis difference between the two hands and use it to control up/down.
            //
            // NOTE: it is the *difference* between the left and right hand position that matters,
            // not the absolute position.
            //
            // getYDelta returns a value between -1 and 1; convenient to decide whether we want
            // to go up or down, and at what speed
            var dy = getYDelta(pos1, pos2);
            if(dy > 0) {
                client.up(dy);
            } else {
                client.down(-dy);
            }

            // similar to up/down control above, but for yaw (spin in place).
            // moving hands forward/backwards relative to each other (like a DJ) 
            // will cause the drone to spin
            var dz = getZDelta(pos1, pos2);
            if(dz > 0) {
                client.clockwise(dz);
            } else {
                client.counterClockwise(-dz);
            }

            // control Z axis. forward/backward
            // according to the vector normal of the left hand, fly either left or right.
            // the left/right command takes a value between 0-1, and conveniently the normal
            // vector is between -1 and 1. This allows the left/right to tilt gradually
            if(norm1[2] > 0) {
                client.front(norm1[2]);
            } else {
                client.back(-norm1[2]);
            }

            // control X axis. Left/right
            // similar idea to above for forward/backward
            if(norm1[0] < 0) {
                client.left(norm1[0]);
            } else {
                client.right(-norm1[0]);
            }
        }
    } else { // landed
        // if we see at least 5 fingers (a full hand spread palm), we should take off
        if(frame.fingers.length >= 5) {
            inAir = true;
            client.takeoff();
        }
    }
});
