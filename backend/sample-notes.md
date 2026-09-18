# AI Fundamentals

Tokens are pieces of text that LLMs process. A single word can be one or more tokens depending on its complexity.

Context window is the maximum number of tokens a model can process in a single conversation. If you exceed it, older messages may be dropped or an error occurs.

Prompt engineering involves crafting inputs to get better outputs from LLMs. Zero-shot means no examples, few-shot means providing examples, and chain-of-thought means asking the model to reason step by step.

Function calling allows LLMs to use external tools. The model decides which tool to call and with what arguments, but your code actually executes it.

Embeddings convert text into numerical vectors that capture meaning. Similar texts have vectors that are close to each other, measured using cosine similarity.