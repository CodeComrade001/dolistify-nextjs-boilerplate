import { SignJWT } from "jose"; // For creating JWT
import { JWTPayload } from "jose"; // JWT Payload type
import { TextEncoder } from "util";
import { deleteSessionInDatabase, fetchSessionInDatabase, storeSessionInDataBase } from "../component/backend_component/LoginBackend";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

// Session Payload Interface
interface SessionPayload extends JWTPayload {
  userId: number;
}

// Create a session JWT
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

// Store session in the database
export async function storeSession(userId: number, sessionToken: string) {
  try {
    const sessionData = {
      token: sessionToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiration
    };
    console.log("🚀 ~ storeSession ~ sessionData:", sessionData)
    const sessionDataFormat = {
      token: sessionToken,
      createdAt: JSON.stringify(new Date()),
      expiresAt: JSON.stringify(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days expiration
    };
    console.log("🚀 ~ storeSession ~ sessionDataFormat:", sessionDataFormat)

    // Insert session into the database (using Prisma)
    const storingSession = await storeSessionInDataBase(userId, sessionDataFormat);
    if (!storingSession || "error" in storingSession) {
      console.log({ error: storingSession?.error || "error storing session" })
      return false;
    }
    const user = storingSession.user.id;
    console.log("🚀 ~ storeSession ~ user:", user)
    return true;
  } catch (error) {
    console.error("Error storing session:", error);
    return false;
  }
}

// Get session by token
export async function getSession(userId: number) {
  try {
    const session = await fetchSessionInDatabase(userId);
    console.log("🚀 ~ getSession ~ session:", session)

    if (session !== undefined) {
      console.log("session was not found found", session);
      console.log("session was found", session);
      return null; // Session expired or not found
    }
    console.log("session was found", session);
    return { session, userId };
  } catch (error) {
    console.error("Error retrieving session:", error);
    return null;
  }
}

// Check for existing session, update or delete if necessary
export async function manageSession(userId: number) {
  console.log("🚀 ~ manageSession ~ userId:", userId)
  try {
    // Fetch the current session (assuming you have a getSession function)
    const sessionData = await fetchSessionInDatabase(userId)
    console.log("🚀 ~ manageSession ~ sessionData:", sessionData)
    const { token, createdAt, expiresAt } = sessionData.session_data;
    // Convert ISO strings to Date objects
    const sessionFormat = {
      token,
      createdAt: new Date(createdAt),
      expiresAt: new Date(expiresAt),
    };
    console.log("🚀 ~ manageSession ~ sessionFormat:", sessionFormat);

    if (sessionData) {
      const currentDate = new Date();
      const sessionExpiresAt = new Date(sessionFormat.expiresAt);

      // Check if session is expired
      if (sessionExpiresAt <= currentDate) {
        // Session expired, delete or update it
        await deleteSession(userId); // Or updateSession depending on your logic
        console.log("Session expired, deleting and creating a new one.");
        return null; // Session expired
      }

      console.log("Session is still valid.");
      return sessionData; // Session is valid
    }

    console.log("No existing session found.");
    return null; // No session found
  } catch (error) {
    console.error("Error managing session:", error);
    return null;
  }
}

// Delete or update the session (you can implement this part yourself)
export async function deleteSession(userId: number) {
  // Implement logic to delete session for the given user ID
  const deletingSession = await deleteSessionInDatabase(userId)
  if (!deletingSession) {
    console.log("failed to delete session")
    return false;
  }
  console.log("Deleting session for user:", userId);
  // Your database logic here
  return true
}


