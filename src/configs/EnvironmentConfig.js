const dev = {
  API_ENDPOINT_URL:
    // "http://ec2-43-204-29-221.ap-south-1.compute.amazonaws.com",
    // "https://ec2-65-2-11-55.ap-south-1.compute.amazonaws.com",
    "http://ec2-65-2-11-55.ap-south-1.compute.amazonaws.com/",
};

const prod = {
  API_ENDPOINT_URL: "/api",
};

const test = {
  API_ENDPOINT_URL: "/api",
};

const getEnv = () => {
  switch (process.env.NODE_ENV) {
    case "development":
      return dev;
    case "production":
      return prod;
    case "test":
      return test;
    default:
      break;
  }
};

export const env = getEnv();
