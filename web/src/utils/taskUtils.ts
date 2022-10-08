export const translatePriority = (priority: number) => {
  switch (priority) {
    case 1:
      return "Högprio";
    case 3:
      return "Lågprio";
  }
};
