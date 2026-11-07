export const LETTERS = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split("");

export const letterOf = (index: number) =>
  LETTERS[index] ? `${LETTERS[index]}.` : `${index + 1}.`;
