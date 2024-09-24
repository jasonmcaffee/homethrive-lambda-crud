import { SSTConfig } from "sst";
import { UserServiceStack } from "./stacks/UserServiceStack";

export default {
  config(_input) {
    return {
      name: "homethrive-lambda-crud",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(UserServiceStack);
  }
} satisfies SSTConfig;
