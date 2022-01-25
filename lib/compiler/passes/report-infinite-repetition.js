"use strict";

import GrammarError from "../../grammar-error.js";
import asts from "../asts.js";
import visitor from "../visitor.js";

// Reports expressions that don't consume any input inside |*| or |+| in the
// grammar, which prevents infinite loops in the generated parser.
function reportInfiniteRepetition(ast) {
  const check = visitor.build({
    zero_or_more(node) {
      if (!asts.alwaysConsumesOnSuccess(ast, node.expression)) {
        throw new GrammarError(
          "Possible infinite loop when parsing (repetition used with an expression that may not consume any input)",
          node.location
        );
      }
    },

    one_or_more(node) {
      if (!asts.alwaysConsumesOnSuccess(ast, node.expression)) {
        throw new GrammarError(
          "Possible infinite loop when parsing (repetition used with an expression that may not consume any input)",
          node.location
        );
      }
    },
  });

  check(ast);
}

export default reportInfiniteRepetition;
