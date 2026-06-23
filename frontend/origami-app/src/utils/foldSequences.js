// Stack-based fold sequences with explicit movingSide.
// movingSide: "positive" = vertices above/right of foldPosition move
//             "negative" = vertices below/left of foldPosition move
// foldAxis: "x" = fold line runs horizontally (y=foldPosition), moving side is up/down
//           "y" = fold line runs vertically (x=foldPosition), moving side is left/right

export const HEART_STEPS = [
  {
    step: 1,
    instruction: "Start with white side up. Fold in half vertically — left edge meets right edge. Crease well and unfold.",
    fold_type: "valley-fold",
    foldAxis: "y",
    foldPosition: 0,
    angle: Math.PI,
    movingSide: "negative",
    duration: 1.2
  },
  {
    step: 2,
    instruction: "Fold in half horizontally — top edge meets bottom edge. Crease well and unfold.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: 0,
    angle: Math.PI,
    movingSide: "positive",
    duration: 1.2
  },
  {
    step: 3,
    instruction: "Fold the bottom half upward to the horizontal center crease.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: 0,
    angle: Math.PI,
    movingSide: "negative",
    duration: 1.2
  },
  {
    step: 4,
    instruction: "Turn the paper over.",
    fold_type: "turn-over",
    foldAxis: "y",
    foldPosition: 0,
    angle: Math.PI,
    movingSide: "positive",
    duration: 1.0
  },
  {
    step: 5,
    instruction: "Fold the bottom-left corner diagonally upward to meet the vertical center crease.",
    fold_type: "valley-fold",
    foldAxis: "y",
    foldPosition: -0.75,
    angle: Math.PI * 0.75,
    movingSide: "negative",
    duration: 1.2
  },
  {
    step: 6,
    instruction: "Fold the bottom-right corner diagonally upward to meet the vertical center crease.",
    fold_type: "valley-fold",
    foldAxis: "y",
    foldPosition: 0.75,
    angle: -Math.PI * 0.75,
    movingSide: "positive",
    duration: 1.2
  },
  {
    step: 7,
    instruction: "Turn the paper over. Fold the top-left edge diagonally downward to the center crease.",
    fold_type: "valley-fold",
    foldAxis: "y",
    foldPosition: -0.5,
    angle: Math.PI * 0.65,
    movingSide: "negative",
    duration: 1.2
  },
  {
    step: 8,
    instruction: "Fold the top-right edge diagonally downward to the center crease.",
    fold_type: "valley-fold",
    foldAxis: "y",
    foldPosition: 0.5,
    angle: -Math.PI * 0.65,
    movingSide: "positive",
    duration: 1.2
  },
  {
    step: 9,
    instruction: "Fold the top flap downward along the horizontal center crease.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: 0.5,
    angle: Math.PI * 0.85,
    movingSide: "positive",
    duration: 1.2
  },
  {
    step: 10,
    instruction: "Fold the top-left and top-right corners downward to round the top of the heart.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: 0.6,
    angle: Math.PI * 0.5,
    movingSide: "positive",
    duration: 1.2
  },
  {
    step: 11,
    instruction: "Turn the model over. Your origami heart is complete!",
    fold_type: "turn-over",
    foldAxis: "y",
    foldPosition: 0,
    angle: Math.PI,
    movingSide: "positive",
    duration: 1.0
  }
];

export const CICADA_STEPS = [
  {
    step: 1,
    instruction: "Start with colored side up. Fold top point down to bottom point to form a triangle.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: 0,
    angle: Math.PI,
    movingSide: "positive",
    duration: 1.2
  },
  {
    step: 2,
    instruction: "Fold the top-right point diagonally down to the bottom point.",
    fold_type: "valley-fold",
    foldAxis: "y",
    foldPosition: 0.5,
    angle: Math.PI * 0.85,
    movingSide: "positive",
    duration: 1.2
  },
  {
    step: 3,
    instruction: "Fold the top-left point diagonally down to the bottom point.",
    fold_type: "valley-fold",
    foldAxis: "y",
    foldPosition: -0.5,
    angle: -Math.PI * 0.85,
    movingSide: "negative",
    duration: 1.2
  },
  {
    step: 4,
    instruction: "Fold both bottom flaps upward to form the wings. Angle slightly outward.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: -0.3,
    angle: -Math.PI * 0.85,
    movingSide: "negative",
    duration: 1.2
  },
  {
    step: 5,
    instruction: "Fold one layer from the bottom upward, leaving a small gap below the wings.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: -0.6,
    angle: Math.PI * 0.75,
    movingSide: "negative",
    duration: 1.2
  },
  {
    step: 6,
    instruction: "Fold the bottom point upward again, leaving a gap — creates body segments.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: -0.45,
    angle: Math.PI * 0.6,
    movingSide: "negative",
    duration: 1.2
  },
  {
    step: 7,
    instruction: "Flip the model over to the other side.",
    fold_type: "turn-over",
    foldAxis: "y",
    foldPosition: 0,
    angle: Math.PI,
    movingSide: "positive",
    duration: 1.0
  },
  {
    step: 8,
    instruction: "Fold the left edge inward to meet the center of the paper.",
    fold_type: "valley-fold",
    foldAxis: "y",
    foldPosition: -0.6,
    angle: Math.PI * 0.9,
    movingSide: "negative",
    duration: 1.2
  },
  {
    step: 9,
    instruction: "Fold the right edge inward to meet the center, slightly overlapping.",
    fold_type: "valley-fold",
    foldAxis: "y",
    foldPosition: 0.6,
    angle: -Math.PI * 0.9,
    movingSide: "positive",
    duration: 1.2
  },
  {
    step: 10,
    instruction: "Fold the top point slightly downward to form the cicada's head.",
    fold_type: "valley-fold",
    foldAxis: "x",
    foldPosition: 0.7,
    angle: Math.PI * 0.45,
    movingSide: "positive",
    duration: 1.2
  },
  {
    step: 11,
    instruction: "Flip the paper over. Your origami cicada is complete! Add eyes to finish.",
    fold_type: "turn-over",
    foldAxis: "y",
    foldPosition: 0,
    angle: Math.PI,
    movingSide: "positive",
    duration: 1.0
  }
];