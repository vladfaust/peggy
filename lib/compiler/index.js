"use strict";

import generateBytecode from "./passes/generate-bytecode.js";
import generateJS from "./passes/generate-js.js";
import inferenceMatchResult from "./passes/inference-match-result.js";
import removeProxyRules from "./passes/remove-proxy-rules.js";
import reportDuplicateLabels from "./passes/report-duplicate-labels.js";
import reportDuplicateRules from "./passes/report-duplicate-rules.js";
import reportInfiniteRecursion from "./passes/report-infinite-recursion.js";
import reportInfiniteRepetition from "./passes/report-infinite-repetition.js";
import reportUndefinedRules from "./passes/report-undefined-rules.js";
import reportIncorrectPlucking from "./passes/report-incorrect-plucking.js";
import visitor from "./visitor.js";

function processOptions(options, defaults) {
  const processedOptions = {};

  Object.keys(options).forEach(name => {
    processedOptions[name] = options[name];
  });

  Object.keys(defaults).forEach(name => {
    if (!Object.prototype.hasOwnProperty.call(processedOptions, name)) {
      processedOptions[name] = defaults[name];
    }
  });

  return processedOptions;
}

const compiler = {
  // AST node visitor builder. Useful mainly for plugins which manipulate the
  // AST.
  visitor,

  // Compiler passes.
  //
  // Each pass is a function that is passed the AST. It can perform checks on it
  // or modify it as needed. If the pass encounters a semantic error, it throws
  // |peg.GrammarError|.
  passes: {
    check: [
      reportUndefinedRules,
      reportDuplicateRules,
      reportDuplicateLabels,
      reportInfiniteRecursion,
      reportInfiniteRepetition,
      reportIncorrectPlucking,
    ],
    transform: [
      removeProxyRules,
      inferenceMatchResult,
    ],
    generate: [
      generateBytecode,
      generateJS,
    ],
  },

  // Generates a parser from a specified grammar AST. Throws |peg.GrammarError|
  // if the AST contains a semantic error. Note that not all errors are detected
  // during the generation and some may protrude to the generated parser and
  // cause its malfunction.
  compile(ast, passes, options) {
    options = options !== undefined ? options : {};

    options = processOptions(options, {
      allowedStartRules: [ast.rules[0].name],
      cache: false,
      dependencies: {},
      exportVar: null,
      format: "bare",
      output: "parser",
      trace: false,
    });

    if (!Array.isArray(options.allowedStartRules)) {
      throw new Error("allowedStartRules must be an array");
    }
    if (options.allowedStartRules.length === 0) {
      throw new Error("Must have at least one start rule");
    }
    const allRules = ast.rules.map(r => r.name);
    for (const rule of options.allowedStartRules) {
      if (allRules.indexOf(rule) === -1) {
        throw new Error(`Unknown start rule "${rule}"`);
      }
    }

    Object.keys(passes).forEach(stage => {
      passes[stage].forEach(p => { p(ast, options); });
    });

    switch (options.output) {
      case "parser":
        return eval(ast.code);

      case "source":
        return ast.code;

      default:
        throw new Error("Invalid output format: " + options.output + ".");
    }
  },
};

export default compiler;
