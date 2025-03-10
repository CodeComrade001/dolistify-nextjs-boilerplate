import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { promisify } from "util";

type SignUpSuccess = { user: { id: number } };
type SignInSuccess = { user: { id: number } };
type SignUpError = { error: string };
type SignInError = { error: string };
type SignUpResult = SignUpSuccess | SignUpError;
type SignInResult = SignInSuccess | SignInError;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

const saltRounds = 10;
const hashAsync = promisify(bcrypt.hash);

async function testConnection() {
  const client = await pool.connect();
  try {
    console.log("Database connection established successfully.");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to connect to the database:', errorMessage);
  } finally {
    client.release();
  }
}
testConnection();

export default async function CreateNewUserAccount(
  userName: string,
  email: string,
  passWord: string
): Promise<SignUpResult> {
  const client = await pool.connect();
  try {
    const checkEmail = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    const checkUsername = await client.query("SELECT * FROM users WHERE username = $1",[userName])
    if (checkEmail.rows.length > 0 ) {
      console.log("User already registered");
      return { error: "User already exists" };
    }else if (checkUsername.rows.length > 0) {
      console.log("UserName already taken");
      return { error: "UserName already Taken" };
    } else {
      // Await the hashed password
      const hash = await hashAsync(passWord, saltRounds);
      console.log("🚀 ~ hash:", hash)
      const result = await client.query(
        "INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id ",
        [email, userName, hash]
      );
      const user = result.rows[0];
      console.log("Username inserted successfully 🚀 ~ bcrypt.hash ~ user:", user);
      return { user };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error('Error inserting user:', errorMessage);
    return { error: errorMessage };
  } finally {
    client.release();
  }
}

export async function LoginExistingAccount(
  userName: string,
  password: string
): Promise<SignInResult> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id, password FROM users WHERE username = $1",
      [userName]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0].id;
      console.log("🚀 ~ user:", user)
      const storedHashedPassword = result.rows[0].password;
      // Use promise-based bcrypt.compare
      const valid = await bcrypt.compare(password, storedHashedPassword);
      console.log("🚀 ~ valid:", valid)

      if (valid) {
        // Passed password check
        return { user: { id: user } };
      } else {
        // Did not pass password check
        return { error: "Wrong Password or Username" };
      }
    }

    console.log("User not found");
    return { error: "user not found" };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error logging in user:", errorMessage);
    return { error: errorMessage };
  } finally {
    client.release();
  }
}


export async function storeSessionInDataBase(
  userId: number,
  sessionData: { token: string, createdAt: string, expiresAt: string }
): Promise<SignUpResult> {
  console.log("🚀 ~ userId:", userId)
  console.log("🚀 ~ sessionData:", sessionData)
  console.log("🚀 ~ storeSessionInDataBase:", storeSessionInDataBase)
  const client = await pool.connect();
  try {
    const checkResult = await client.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (checkResult.rows.length === 0) {
      console.log("user is not registered");
      return { error: "user is not registered" };
    } else {
      const result = await client.query(
        "INSERT INTO session (user_id, session_data) VALUES ($1, $2) RETURNING id ",
        [userId, sessionData]
      );
      const user = result.rows[0];
      console.log("Username inserted successfully 🚀 ~ bcrypt.hash ~ user:", user);
      return { user };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error('Error inserting user:', errorMessage);
    return { error: errorMessage };
  } finally {
    client.release();
  }
}

export async function fetchSessionInDatabase(userId: number) {
  const client = await pool.connect();
  try {
    const checkResult = await client.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (checkResult.rows.length === 0) {
      console.log("user is not registered");
      return [];
    } else {
      const result = await client.query(
        "SELECT session_data FROM session WHERE user_id =  $1 ",
        [userId]
      );
      const session = result.rows[0];
      console.log("Username inserted successfully 🚀 ~ bcrypt.hash ~ user:", session);
      return session;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error('Error inserting user:', errorMessage);
    return [];
  } finally {
    client.release();
  }
}

export async function deleteSessionInDatabase(userId: number) {
  const client = await pool.connect();
  try {
    // Check if the user exists
    const checkResult = await client.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (checkResult.rows.length === 0) {
      console.log("User is not registered");
      return false;
    } 

    // Corrected SQL query to delete session
    const result = await client.query(
      "DELETE FROM session WHERE user_id = $1 RETURNING id, user_id",
      [userId]
    );

    if (result.rows.length === 0) {
      console.log("No session found for user:", userId);
      return false;
    }

    const session = result.rows[0];
    console.log("Session successfully deleted:", session);
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting session:", errorMessage);
    return false;
  } finally {
    client.release();
  }
}

export async function userInformation(userId : number) {
  const client = await pool.connect();
  try {
    // Check if the user exists
    const result = await client.query("SELECT username, email FROM users WHERE id = $1", [userId]);
    if (result.rows.length > 0) {
      console.log("fetching user details failed User is not registered");
      return [];
    } 
    const user = result.rows[0];
    console.log("Session successfully deleted:", user);
    return user;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting session:", errorMessage);
    return [];
  } finally {
    client.release();
  }
} 