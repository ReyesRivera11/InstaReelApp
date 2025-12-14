import { SocialIdentity } from "@prisma/client";
import { FacebookReelStrategy } from "../strategies/facebookReel.strategy";
import { InstagramReelStrategy } from "../strategies/instagramReel.strategy";

export class ReelStrategyFactory {
  static createStrategy(
    socialIdentity: SocialIdentity
  ) {
    switch (socialIdentity) {
      case SocialIdentity.INSTAGRAM:
        return new InstagramReelStrategy();
      case SocialIdentity.FACEBOOK:
        return new FacebookReelStrategy();
      default:
        throw new Error(`Unsupported social identity: ${socialIdentity}`);
    }
  }
}
