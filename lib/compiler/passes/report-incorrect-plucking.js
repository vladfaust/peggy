"use strict";

import GrammarError from "../../grammar-error.js";
import visitor from "../visitor.js";

//
// Compiler pass to ensure the following are enforced:
//
//   - plucking can not be done with an action block
//
function reportIncorrectPlucking(ast) {
  const check = visitor.build({
    action(node) {
      check(node.expression, node);
    },

    labeled(node, action) {
      if (node.pick) {
        if (action) {
          throw new GrammarError(
            "\"@\" cannot be used with an action block",
            node.labelLocation,
            [{
              message: "Action block location",
              location: action.codeLocation,
            }]
          );
        }
      }

      check(node.expression);
    },
  });

  check(ast);
}

export default reportIncorrectPlucking;
