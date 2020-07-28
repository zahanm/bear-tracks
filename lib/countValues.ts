export interface Count {
  value: string;
  count: number;
}

export function countValues(values: Array<string>): Array<Count> {
  const counts = values.reduce(
    (acc: Record<string, number>, current: string) => {
      if (current in acc) {
        acc[current] += 1;
      } else {
        acc[current] = 1;
      }
      return acc;
    },
    {}
  );
  return Object.entries(counts).map((tup) => {
    return {
      value: tup[0],
      count: tup[1],
    };
  });
}
