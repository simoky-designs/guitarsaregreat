export const toTitleCase = (str: string) => 
  str.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');


