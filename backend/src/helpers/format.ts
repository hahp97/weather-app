export const parseHTML = (html: string) => {
  const regex = /\{\{\s*(.*?)\s*\}\}/g;
  const parsedHTML = html.replace(regex, "<%= $1 %>");
  return parsedHTML;
};
