export const CRANE_STEPS = [
  {
    step: 1,
    instruction: "Start with a square sheet colored side down. Fold in half diagonally to form a triangle.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: 0,
    angle: Math.PI * 0.85,
    duration: 1.2
  },
  {
    step: 2,
    instruction: "Fold in half again to form a smaller triangle.",
    fold_type: "valley-fold",
    foldAxis: "y",
    foldPosition: 0,
    angle: Math.PI * 0.85,
    duration: 1.2
  },
  {
    step: 3,
    instruction: "Open the top flap and squash fold to form a square.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: 0.1,
    angle: -Math.PI * 0.4,
    duration: 1.4
  },
  {
    step: 4,
    instruction: "Fold the left and right edges to the center crease.",
    fold_type: "valley-fold",
    foldAxis: "y",
    foldPosition: 0.3,
    angle: Math.PI * 0.35,
    duration: 1.2
  },
  {
    step: 5,
    instruction: "Fold the top point down to the bottom.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: 0.4,
    angle: Math.PI * 0.45,
    duration: 1.0
  },
  {
    step: 6,
    instruction: "Unfold the flaps from steps 4 and 5 back out.",
    fold_type: "fold-unfold",
    foldAxis: "y",
    foldPosition: 0.3,
    angle: -Math.PI * 0.35,
    duration: 1.0
  },
  {
    step: 7,
    instruction: "Lift the bottom corner upward, reverse folding along the creases.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: -0.2,
    angle: Math.PI * 0.45,
    duration: 1.4
  },
  {
    step: 8,
    instruction: "Repeat steps 3 to 7 on the other side.",
    fold_type: "valley-fold",
    foldAxis: "y",
    foldPosition: -0.3,
    angle: Math.PI * 0.35,
    duration: 1.2
  },
  {
    step: 9,
    instruction: "Fold both bottom flaps upward along the center line.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: 0.15,
    angle: Math.PI * 0.4,
    duration: 1.2
  },
  {
    step: 10,
    instruction: "Inside reverse fold one tip downward to form the crane's head.",
    fold_type: "push-in",
    foldAxis: "y",
    foldPosition: 0.6,
    angle: -Math.PI * 0.18,
    duration: 1.4
  },
  {
    step: 11,
    instruction: "Gently pull the wings apart and press the bottom to open the body. Your crane is complete!",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: 0,
    angle: -Math.PI * 0.12,
    duration: 1.6
  }
];

export const BOAT_STEPS = [
  {
    step: 1,
    instruction: "Start with a rectangle, white side up. Fold in half horizontally.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: 0,
    angle: Math.PI * 0.85,
    duration: 1.2
  },
  {
    step: 2,
    instruction: "Fold the top corners down to meet the center bottom edge.",
    fold_type: "valley-fold",
    foldAxis: "y",
    foldPosition: 0.35,
    angle: Math.PI * 0.38,
    duration: 1.2
  },
  {
    step: 3,
    instruction: "Fold the front bottom strip upward.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: -0.45,
    angle: Math.PI * 0.5,
    duration: 1.2
  },
  {
    step: 4,
    instruction: "Flip over and fold the other bottom strip upward to match.",
    fold_type: "turn-over",
    foldAxis: "x",
    foldPosition: -0.45,
    angle: Math.PI * 0.5,
    duration: 1.2
  },
  {
    step: 5,
    instruction: "Open the hat from the bottom and flatten into a diamond shape.",
    fold_type: "fold-unfold",
    foldAxis: "y",
    foldPosition: 0,
    angle: -Math.PI * 0.28,
    duration: 1.4
  },
  {
    step: 6,
    instruction: "Fold the bottom points up to the top point on both sides.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: 0.25,
    angle: Math.PI * 0.45,
    duration: 1.2
  },
  {
    step: 7,
    instruction: "Gently pull the two sides apart to open and form the boat. Complete!",
    fold_type: "fold-unfold",
    foldAxis: "x",
    foldPosition: 0,
    angle: -Math.PI * 0.3,
    duration: 1.6
  }
];