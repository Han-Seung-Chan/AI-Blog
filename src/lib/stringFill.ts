export function fillPromptTemplate(
  template: string,
  data: Record<string, any>,
): string {
  let filledTemplate = template;

  Object.entries(data).forEach(([key, value]) => {
    filledTemplate = filledTemplate.replace(
      new RegExp(`{{${key}}}`, "g"),
      String(value),
    );
  });

  return filledTemplate;
}
