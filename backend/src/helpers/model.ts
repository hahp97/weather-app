export function compareObject(object: any, compareObject: any) {
  if (!object) return false;
  if (!compareObject) return true;

  try {
    const sameValue = Object.keys(compareObject).every((key) => {
      if (key === "AND") {
        const checkAll = compareObject[key].every((item: any) => compareObject(object, item));
        return checkAll;
      }

      if (key === "OR") {
        const checkSome = compareObject[key].some((item: any) => compareObject(object, item));
        return checkSome;
      }

      if (key === "_id" || key.match(/Id$/))
        return (compareObject[key] || "").toString() === (object[key] || "").toString();
      if (key === "_id_in")
        return compareObject["_id_in"].some((item: any) => object._id.toString() === item.toString());

      const [dataKey, operand] = (key || "").split("_") || [];
      if (operand === "ne") return compareObject[key] !== object[dataKey];
      if (operand === "nin") return !compareObject[key].includes(object[dataKey]);
      if (operand === "in") {
        if (typeof object[dataKey] === "string") {
          return compareObject[key].some((item: any) => object[dataKey] === item);
        } else if (Array.isArray(object[dataKey])) {
          return compareObject[key].some((item: any) => object[dataKey].includes(item));
        } else {
          return false;
        }
      }

      if (operand === "gte") {
        if (dataKey.includes("At")) return object[dataKey] >= new Date(compareObject[key]).getTime();
        return object[dataKey] >= compareObject[key];
      }
      if (operand === "gt") {
        if (dataKey.includes("At")) return object[dataKey] > new Date(compareObject[key]).getTime();
        return object[dataKey] > compareObject[key];
      }
      if (operand === "lte") {
        if (dataKey.includes("At")) return object[dataKey] <= new Date(compareObject[key]).getTime();
        return object[dataKey] <= compareObject[key];
      }
      if (operand === "lt") {
        if (dataKey.includes("At")) return object[dataKey] < new Date(compareObject[key]).getTime();
        return object[dataKey] < compareObject[key];
      }
      if (operand === "regex") {
        return object[dataKey].toLowerCase().includes(compareObject[key].toLowerCase());
      }

      return object[key] === compareObject[key] || (!(key in object) && compareObject[key] == null);
    });

    return sameValue;
  } catch (err) {
    console.log("[ERROR] Listener Comparison Failed. ", err);
    return false;
  }
}

export const prepareFloatingNumber = (number: number, opts: any = {}) => {
  const { precision = 2 } = opts;
  if (isNaN(Number(number))) return number;
  if (isNaN(Number(precision))) {
    throw new Error("precision must be a number");
  }

  if (Number(precision) <= 0) {
    throw new Error("precision must be a positive number");
  }

  return Math.round(number * Math.pow(10, precision)) / Math.pow(10, precision);
};
