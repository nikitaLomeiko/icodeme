export function applyPromptVariables(
  prompt: string,
  variables: Record<string, string>,
): string {
  let result = prompt;

  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`#${key}#`, value);
  }

  return result;
}
