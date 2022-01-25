"use strict";

import GrammarError from "../../grammar-error.js";
import asts from "../asts.js";
import visitor from "../visitor.js";

// Checks that all referenced rules exist.
function reportUndefinedRules(ast) {
  const check = visitor.build({
    rule_ref(node) {
      if (!asts.findRule(ast, node.name)) {
        throw new GrammarError(
          `Rule "${node.name}" is not defined`,
          node.location
        );
      }
    },
  });

  check(ast);
}

export default reportUndefinedRules;
