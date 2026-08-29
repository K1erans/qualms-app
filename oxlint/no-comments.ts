import { defineRule, eslintCompatPlugin } from "@oxlint/plugins";

export default eslintCompatPlugin({
	meta: { name: "no-comments" },
	rules: {
		"no-comments": defineRule({
			meta: {
				type: "suggestion",
				docs: {
					description: "Disallow comments in source files.",
				},
				messages: {
					noComments: "Comments are not allowed. Make the code self-explanatory instead.",
				},
			},
			createOnce(context) {
				return {
					Program() {
						for (const comment of context.sourceCode.getAllComments()) {
							if (comment.type === "Shebang") continue;
							context.report({ loc: comment.loc, messageId: "noComments" });
						}
					},
				};
			},
		}),
	},
});
