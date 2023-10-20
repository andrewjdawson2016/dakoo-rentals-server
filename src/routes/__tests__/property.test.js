const { validateNewProperty } = require("../property");

describe("validateNewProperty", () => {
  it("should validate a correct address", () => {
    const result = validateNewProperty({ address: "123 Main Street" });
    console.log(result.error);
    expect(result.error).toBeUndefined();
  });

  it("should return an error if address is all digits", () => {
    const result = validateNewProperty({ address: "1234567890" });
    expect(result.error).toBeDefined();
  });

  it("should return an error if address is less than 10 characters", () => {
    const result = validateNewProperty({ address: "123 Main" });
    expect(result.error).toBeDefined();
  });

  it("should return an error if address is not provided", () => {
    const result = validateNewProperty({});
    expect(result.error).toBeDefined();
  });
});
