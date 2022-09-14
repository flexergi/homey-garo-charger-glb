# Status fetch while mode set in progress
Block both status fetch and and abort/ignore any in-flight fetch since we don't want
to overwrite the mode that we're setting to be overwritten by old status.
