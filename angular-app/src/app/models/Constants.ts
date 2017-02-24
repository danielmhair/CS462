export class Constants {
  public static DOMAIN: string = "https://www.danielmhair.com";
  public static APP_URL: string = `${Constants.DOMAIN}/foursquare-integration/`;
  public static API_ROOT: string = `${Constants.DOMAIN}/api`;
  public static USER_API: string = `${Constants.API_ROOT}/users`;
  public static AUTH_API: string = `${Constants.DOMAIN}/auth`;
  public static GOOGLE_LOGIN: string = `${Constants.AUTH_API}/google`;
  public static FACEBOOK_LOGIN: string = `${Constants.AUTH_API}/facebook`;
  public static TWITTER_LOGIN: string = `${Constants.AUTH_API}/twitter`;
  public static FOURSQUARE_LOGIN: string = `${Constants.AUTH_API}/foursquare`;
}
