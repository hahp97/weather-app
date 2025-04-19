import { REDIS_CONNECTION } from "@/constants";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { RedisOptions } from "ioredis";

class EmptyPubSub {
  constructor() {
    const instance = {
      publish: () => {
        console.log("[DEBUG] Nothing to publish.");
        return "Nothing to publish.";
      },
      asyncIterator: (key: string) => {},
    };

    return instance;
  }
  asyncIterator: any;
  publish: any;
}

const pubSubInstance = new RedisPubSub({
  connection: REDIS_CONNECTION as RedisOptions,
});

export default pubSubInstance;
