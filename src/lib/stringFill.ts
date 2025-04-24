import { PromptData } from "@/types/prompt";

export function fillPromptTemplate(template: string, data: PromptData): string {
  let filledTemplate = template;

  Object.entries(data).forEach(([key, value]) => {
    filledTemplate = filledTemplate.replace(
      new RegExp(`{{${key}}}`, "g"),
      String(value),
    );
  });

  return filledTemplate;
}
