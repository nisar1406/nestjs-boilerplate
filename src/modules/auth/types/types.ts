// Custom type for user object, extending Express Request
export interface IGoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  googleId: string;
  tokenId: string; // Add tokenId here
}
