export function nextRepeat(currentRepeat: string) {
  const repeats = ["Никогда", "Каждый день", "Каждую неделю"];
  const index = repeats.indexOf(currentRepeat);
  return repeats[(index + 1) % repeats.length];
}
