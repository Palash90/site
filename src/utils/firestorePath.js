const prefix = process.env.REACT_APP_ENV === "dev" ? "dev_" : "";
export const col = (name) => prefix + name;
