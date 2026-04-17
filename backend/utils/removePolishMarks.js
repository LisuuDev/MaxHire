const removePolishMarks = (tekst) => {
  if (typeof tekst !== "string") return tekst;
  return tekst
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L");
};
module.exports = removePolishMarks;
