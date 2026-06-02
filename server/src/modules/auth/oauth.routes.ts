import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { env } from "../../config/env";
import { OAuthService } from "./oauth.service";

const oauthService = new OAuthService();
const router = Router();

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

if (env.GOOGLE_CLIENT_ID) {
  passport.use(new GoogleStrategy({
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${env.SERVER_URL}/api/auth/google/callback`,
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error("No email from Google"), undefined);
      const result = await oauthService.findOrCreateUser("google", {
        id: profile.id,
        email,
        name: profile.displayName,
        avatar: profile.photos?.[0]?.value,
      });
      done(null, result);
    } catch (err) {
      done(err, undefined);
    }
  }));
}

if (env.GITHUB_CLIENT_ID) {
  passport.use(new GitHubStrategy({
    clientID: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    callbackURL: `${env.SERVER_URL}/api/auth/github/callback`,
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || `${profile.username}@github.oauth`;
      const result = await oauthService.findOrCreateUser("github", {
        id: profile.id,
        email,
        name: profile.displayName || profile.username || "GitHub User",
        avatar: profile.photos?.[0]?.value,
      });
      done(null, result);
    } catch (err) {
      done(err, undefined);
    }
  }));
}

function oauthRedirect(provider: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authenticator = passport.authenticate(provider, { session: false, scope: ["profile", "email"] });
    authenticator(req, res, next);
  };
}

function oauthCallback(provider: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(provider, { session: false }, (err: any, result: any) => {
      if (err || !result) {
        return res.redirect(`${env.CLIENT_URL}/login?oauth_error=${encodeURIComponent(err?.message || "Authentication failed")}`);
      }
      const redirectUrl = result.isNew
        ? `${env.CLIENT_URL}/onboarding?token=${result.token}`
        : `${env.CLIENT_URL}/login?token=${result.token}`;
      res.redirect(redirectUrl);
    })(req, res, next);
  };
}

router.get("/google", (req, res, next) => {
  if (!env.GOOGLE_CLIENT_ID) {
    res.status(400).json({ error: "Google OAuth is not configured" });
    return;
  }
  oauthRedirect("google")(req, res, next);
});

router.get("/google/callback", oauthCallback("google"));

router.get("/github", (req, res, next) => {
  if (!env.GITHUB_CLIENT_ID) {
    res.status(400).json({ error: "GitHub OAuth is not configured" });
    return;
  }
  oauthRedirect("github")(req, res, next);
});

router.get("/github/callback", oauthCallback("github"));

export default router;
