leap = require('leapjs');
ardrone = require('ar-drone');

var client = ardrone.createClient();

function limit(val) {
    if(val > 1) {
        return 1;
    }

    if(val < -1) {
        return -1;
    }

    return val;
}

// returns value between -1 to 1 representing the diference between hand positions
function getYDelta(pos1, pos2) {
    return limit((pos2[1] - pos1[1]) / 200);
}

function getZDelta(pos1, pos2) {
    return limit((pos2[2] - pos1[2]) / 200);
}

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


var inAir = false;

leap.loop(function(frame) {
    if(frame.hands.length > 0) {
        if(inAir) {
            if(frame.fingers.length == 0) {
                client.land();
                inAir = false;
            }

            if(frame.hands.length >= 1) {
                var hand1 = getLeftHand(frame.hands);
                var pos1 = hand1.palmPosition;
                var norm1 = hand1.palmNormal;
                var hand2 = getRightHand(frame.hands);
                var pos2 = hand2.palmPosition;

                var dy = getYDelta(pos1, pos2);
                if(dy > 0) {
                    client.up(dy);
                } else {
                    client.down(-dy);
                }

                var dz = getZDelta(pos1, pos2);
                if(dz > 0) {
                    client.clockwise(dz);
                } else {
                    client.counterClockwise(-dz);
                }

                if(norm1[2] > 0) {
                    client.front(norm1[2]);
                } else {
                    client.back(-norm1[2]);
                }

                if(norm1[0] < 0) {
                    client.left(norm1[0]);
                } else {
                    client.right(-norm1[0]);
                }
            }
        } else { // landed
            if(frame.fingers.length >= 5) {
                inAir = true;
                client.takeoff();
            }
        }
    }
});
