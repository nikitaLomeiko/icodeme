export const quizLetters = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split("");

export const letterOf = (index: number) =>
  quizLetters[index] ? `${quizLetters[index]}.` : `${index + 1}.`;
